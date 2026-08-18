import { PoolClient } from 'pg';
import { pool, withTransaction } from './pool';
import { config } from '../config';

export interface UserBalanceInfo {
  id: string;
  username: string;
  role: string;
  credit_limit: number;
  available_credit: number;
  exposure: number;
}

export interface PlaceBetParams {
  userId: string;
  marketId: string;
  selectionId: number;
  type: 'BACK' | 'LAY';
  price: number;
  stake: number;
}

export interface SettlementResult {
  marketId: string;
  winningSelectionId: number;
  settledBetsCount: number;
  totalVolume: number;
  totalCommission: number;
}

/**
 * Calculates net exposure and P&L across all selections in a market for a given user.
 * Implements standard Betfair worst-case exposure netting.
 */
export async function calculateMarketExposure(
  client: PoolClient,
  userId: string,
  marketId: string,
  pendingBet?: {
    selectionId: number;
    type: 'BACK' | 'LAY';
    price: number;
    stake: number;
  }
): Promise<{
  netExposure: number;
  pnlMatrix: Record<number, number>;
}> {
  // 1. Get all active selections for this market
  const selectionsRes = await client.query(
    `SELECT selection_id FROM market_selections WHERE market_id = $1 ORDER BY selection_id ASC`,
    [marketId]
  );

  const selections = selectionsRes.rows.map((r) => r.selection_id as number);
  if (selections.length === 0) {
    throw new Error(`Market ${marketId} has no configured selections`);
  }

  // 2. Get all open or matched bets for this user in this market
  const betsRes = await client.query(
    `SELECT id, selection_id, type, price, stake, matched_stake, status 
     FROM bets 
     WHERE user_id = $1 AND market_id = $2 AND status IN ('UNMATCHED', 'PARTIALLY_MATCHED', 'MATCHED')`,
    [userId, marketId]
  );

  const activeBets = betsRes.rows.map((b) => ({
    selectionId: parseInt(b.selection_id, 10),
    type: b.type as 'BACK' | 'LAY',
    price: parseFloat(b.price),
    stake: parseFloat(b.stake),
    matchedStake: parseFloat(b.matched_stake)
  }));

  if (pendingBet) {
    activeBets.push({
      selectionId: pendingBet.selectionId,
      type: pendingBet.type,
      price: pendingBet.price,
      stake: pendingBet.stake,
      matchedStake: 0
    });
  }

  const pnlMatrix: Record<number, number> = {};

  // For each selection if it wins:
  for (const winningSel of selections) {
    let runnerOutcomePnL = 0;

    for (const bet of activeBets) {
      const isWinner = bet.selectionId === winningSel;

      if (bet.type === 'BACK') {
        if (isWinner) {
          // Back bet won: profit is stake * (price - 1)
          runnerOutcomePnL += bet.stake * (bet.price - 1);
        } else {
          // Back bet lost: lose stake
          runnerOutcomePnL -= bet.stake;
        }
      } else if (bet.type === 'LAY') {
        if (isWinner) {
          // Lay bet lost: payout liability = stake * (price - 1)
          runnerOutcomePnL -= bet.stake * (bet.price - 1);
        } else {
          // Lay bet won: keep backer's stake
          runnerOutcomePnL += bet.stake;
        }
      }
    }

    pnlMatrix[winningSel] = Math.round(runnerOutcomePnL * 100) / 100;
  }

  // Worst-case loss across all possible winning outcomes
  const minPnL = Math.min(...Object.values(pnlMatrix));
  const worstCaseExposure = minPnL < 0 ? Math.abs(minPnL) : 0;

  return {
    netExposure: Math.round(worstCaseExposure * 100) / 100,
    pnlMatrix
  };
}

/**
 * Atomically allocates credit down the hierarchy tree.
 */
export async function allocateCreditAtomic(
  senderId: string,
  receiverId: string,
  amount: number,
  notes?: string
): Promise<{
  senderAvailable: number;
  receiverAvailable: number;
  referenceId: string;
}> {
  if (amount <= 0) {
    throw new Error('Credit allocation amount must be greater than zero');
  }

  return withTransaction(async (client) => {
    // 1. Lock Sender
    const senderRes = await client.query(
      `SELECT id, username, role, credit_limit, available_credit, exposure FROM users WHERE id = $1 FOR UPDATE`,
      [senderId]
    );
    if (senderRes.rows.length === 0) {
      throw new Error('Sender user not found');
    }
    const sender = senderRes.rows[0];

    // 2. Lock Receiver
    const receiverRes = await client.query(
      `SELECT id, username, role, parent_id, credit_limit, available_credit, exposure FROM users WHERE id = $1 FOR UPDATE`,
      [receiverId]
    );
    if (receiverRes.rows.length === 0) {
      throw new Error('Receiver user not found');
    }
    const receiver = receiverRes.rows[0];

    // 3. Validate hierarchy relationship: sender must be direct parent (unless sender is ADMIN)
    if (sender.role !== 'ADMIN' && receiver.parent_id !== sender.id) {
      throw new Error(`Unauthorized: ${sender.username} is not the direct parent of ${receiver.username}`);
    }

    // 4. Validate sender balance (if not ADMIN genesis)
    const senderAvailable = parseFloat(sender.available_credit);
    if (sender.role !== 'ADMIN' && senderAvailable < amount) {
      throw new Error(
        `Insufficient credit: ${sender.username} has available credit ${senderAvailable.toFixed(2)}, attempted to allocate ${amount.toFixed(2)}`
      );
    }

    const referenceId = `ALLOC_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 5. Update balances
    const newSenderAvail = sender.role === 'ADMIN' ? senderAvailable : senderAvailable - amount;
    const newReceiverAvail = parseFloat(receiver.available_credit) + amount;
    const newReceiverLimit = parseFloat(receiver.credit_limit) + amount;

    if (sender.role !== 'ADMIN') {
      await client.query(
        `UPDATE users SET available_credit = $1, updated_at = NOW() WHERE id = $2`,
        [newSenderAvail, senderId]
      );
    }

    await client.query(
      `UPDATE users SET available_credit = $1, credit_limit = $2, updated_at = NOW() WHERE id = $3`,
      [newReceiverAvail, newReceiverLimit, receiverId]
    );

    // 6. Insert double-entry ledger entry
    await client.query(
      `INSERT INTO ledger_entries (sender_id, receiver_id, amount, transaction_type, reference_id, notes)
       VALUES ($1, $2, $3, 'CREDIT_ALLOCATION', $4, $5)`,
      [senderId, receiverId, amount, referenceId, notes || `Credit allocated from ${sender.username} to ${receiver.username}`]
    );

    return {
      senderAvailable: newSenderAvail,
      receiverAvailable: newReceiverAvail,
      referenceId
    };
  });
}

/**
 * Atomically recalls credit back from a child node to parent.
 */
export async function recallCreditAtomic(
  senderId: string, // Parent initiating recall
  receiverId: string, // Child from whom credit is recalled
  amount: number,
  notes?: string
): Promise<{
  parentAvailable: number;
  childAvailable: number;
  referenceId: string;
}> {
  if (amount <= 0) {
    throw new Error('Credit recall amount must be greater than zero');
  }

  return withTransaction(async (client) => {
    // 1. Lock Parent & Child
    const parentRes = await client.query(
      `SELECT id, username, role, credit_limit, available_credit FROM users WHERE id = $1 FOR UPDATE`,
      [senderId]
    );
    const childRes = await client.query(
      `SELECT id, username, role, parent_id, credit_limit, available_credit, exposure FROM users WHERE id = $1 FOR UPDATE`,
      [receiverId]
    );

    if (parentRes.rows.length === 0 || childRes.rows.length === 0) {
      throw new Error('Parent or child user account not found');
    }

    const parent = parentRes.rows[0];
    const child = childRes.rows[0];

    if (parent.role !== 'ADMIN' && child.parent_id !== parent.id) {
      throw new Error(`Unauthorized: ${parent.username} is not the direct parent of ${child.username}`);
    }

    const childAvail = parseFloat(child.available_credit);
    if (childAvail < amount) {
      throw new Error(
        `Cannot recall credit: child ${child.username} has only ${childAvail.toFixed(2)} unencumbered credit (exposure: ${parseFloat(child.exposure).toFixed(2)})`
      );
    }

    const referenceId = `RECALL_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newChildAvail = childAvail - amount;
    const newChildLimit = Math.max(0, parseFloat(child.credit_limit) - amount);
    const newParentAvail = parseFloat(parent.available_credit) + amount;

    await client.query(
      `UPDATE users SET available_credit = $1, credit_limit = $2, updated_at = NOW() WHERE id = $3`,
      [newChildAvail, newChildLimit, child.id]
    );

    if (parent.role !== 'ADMIN') {
      await client.query(
        `UPDATE users SET available_credit = $1, updated_at = NOW() WHERE id = $2`,
        [newParentAvail, parent.id]
      );
    }

    await client.query(
      `INSERT INTO ledger_entries (sender_id, receiver_id, amount, transaction_type, reference_id, notes)
       VALUES ($1, $2, $3, 'CREDIT_RECALL', $4, $5)`,
      [child.id, parent.id, amount, referenceId, notes || `Credit recalled from ${child.username} to ${parent.username}`]
    );

    return {
      parentAvailable: newParentAvail,
      childAvailable: newChildAvail,
      referenceId
    };
  });
}

/**
 * Atomically places a Back or Lay bet with atomic row-locking and worst-case liability lock.
 */
export async function placeBetAtomic(params: PlaceBetParams): Promise<{
  bet: any;
  availableCredit: number;
  exposure: number;
  deltaExposure: number;
}> {
  const { userId, marketId, selectionId, type, price, stake } = params;

  if (price <= 1.0) {
    throw new Error('Bet price must be strictly greater than 1.00');
  }
  if (stake <= 0) {
    throw new Error('Bet stake must be strictly greater than 0.00');
  }

  return withTransaction(async (client) => {
    // 1. Lock user row
    const userRes = await client.query(
      `SELECT id, username, role, credit_limit, available_credit, exposure, is_active FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );
    if (userRes.rows.length === 0) {
      throw new Error('User not found');
    }
    const user = userRes.rows[0];
    if (!user.is_active) {
      throw new Error('User account is suspended');
    }

    // 2. Lock and validate market
    const marketRes = await client.query(
      `SELECT id, event_name, status, is_locked FROM markets WHERE id = $1 FOR UPDATE`,
      [marketId]
    );
    if (marketRes.rows.length === 0) {
      throw new Error('Market not found');
    }
    const market = marketRes.rows[0];
    if (market.status !== 'OPEN' || market.is_locked) {
      throw new Error(`Market is currently suspended or locked for betting (status: ${market.status})`);
    }

    // 3. Validate selection exists
    const selRes = await client.query(
      `SELECT selection_id, selection_name FROM market_selections WHERE market_id = $1 AND selection_id = $2`,
      [marketId, selectionId]
    );
    if (selRes.rows.length === 0) {
      throw new Error(`Selection ${selectionId} does not exist in market ${marketId}`);
    }

    // 4. Calculate current market exposure vs new exposure
    const currentExpResult = await calculateMarketExposure(client, userId, marketId);
    const newExpResult = await calculateMarketExposure(client, userId, marketId, {
      selectionId,
      type,
      price,
      stake
    });

    const currentMarketExposure = currentExpResult.netExposure;
    const newMarketExposure = newExpResult.netExposure;
    const deltaExposure = Math.max(0, Math.round((newMarketExposure - currentMarketExposure) * 100) / 100);

    const userAvailableCredit = parseFloat(user.available_credit);
    const userTotalExposure = parseFloat(user.exposure);

    if (userAvailableCredit < deltaExposure) {
      throw new Error(
        `Insufficient credit for liability lock. Required delta liability: ${deltaExposure.toFixed(2)}, Available: ${userAvailableCredit.toFixed(2)}`
      );
    }

    // 5. Update user credit balances
    const updatedAvailableCredit = Math.round((userAvailableCredit - deltaExposure) * 100) / 100;
    const updatedExposure = Math.round((userTotalExposure + deltaExposure) * 100) / 100;

    await client.query(
      `UPDATE users SET available_credit = $1, exposure = $2, updated_at = NOW() WHERE id = $3`,
      [updatedAvailableCredit, updatedExposure, userId]
    );

    // 6. Insert new bet
    const nominalLiability = type === 'BACK' ? stake : Math.round(stake * (price - 1) * 100) / 100;

    const insertBetRes = await client.query(
      `INSERT INTO bets (user_id, market_id, selection_id, type, price, stake, matched_stake, liability, status)
       VALUES ($1, $2, $3, $4, $5, $6, 0.00, $7, 'UNMATCHED')
       RETURNING *`,
      [userId, marketId, selectionId, type, price, stake, nominalLiability]
    );

    const bet = insertBetRes.rows[0];

    return {
      bet,
      availableCredit: updatedAvailableCredit,
      exposure: updatedExposure,
      deltaExposure
    };
  });
}

/**
 * Atomically cancels an unmatched or partially matched bet and unlocks freed liability.
 */
export async function cancelBetAtomic(
  userId: string,
  betId: string
): Promise<{
  bet: any;
  refundedCredit: number;
  availableCredit: number;
  exposure: number;
}> {
  return withTransaction(async (client) => {
    // 1. Lock user
    const userRes = await client.query(
      `SELECT id, available_credit, exposure FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );
    if (userRes.rows.length === 0) {
      throw new Error('User not found');
    }
    const user = userRes.rows[0];

    // 2. Lock bet
    const betRes = await client.query(
      `SELECT * FROM bets WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [betId, userId]
    );
    if (betRes.rows.length === 0) {
      throw new Error('Bet not found or does not belong to user');
    }
    const bet = betRes.rows[0];

    if (bet.status !== 'UNMATCHED' && bet.status !== 'PARTIALLY_MATCHED') {
      throw new Error(`Cannot cancel bet in status '${bet.status}'`);
    }

    const marketId = bet.market_id;

    // Calculate current market exposure before cancelling
    const currentExp = await calculateMarketExposure(client, userId, marketId);

    // Update bet status to CANCELLED (or adjust stake if partially matched)
    if (parseFloat(bet.matched_stake) > 0) {
      await client.query(
        `UPDATE bets SET status = 'MATCHED', stake = matched_stake, updated_at = NOW() WHERE id = $1`,
        [betId]
      );
    } else {
      await client.query(
        `UPDATE bets SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1`,
        [betId]
      );
    }

    // Calculate new exposure after cancellation
    const newExp = await calculateMarketExposure(client, userId, marketId);
    const freedExposure = Math.max(0, Math.round((currentExp.netExposure - newExp.netExposure) * 100) / 100);

    const newAvailable = parseFloat(user.available_credit) + freedExposure;
    const newTotalExp = Math.max(0, parseFloat(user.exposure) - freedExposure);

    await client.query(
      `UPDATE users SET available_credit = $1, exposure = $2, updated_at = NOW() WHERE id = $3`,
      [newAvailable, newTotalExp, userId]
    );

    return {
      bet: { ...bet, status: parseFloat(bet.matched_stake) > 0 ? 'MATCHED' : 'CANCELLED' },
      refundedCredit: freedExposure,
      availableCredit: newAvailable,
      exposure: newTotalExp
    };
  });
}

/**
 * Atomically settles a market, executing double-entry ledger payouts and operator commission rakes.
 */
export async function settleMarketAtomic(
  marketId: string,
  winningSelectionId: number,
  commissionRate: number = config.commissionRate
): Promise<SettlementResult> {
  return withTransaction(async (client) => {
    // 1. Lock and update market
    const marketRes = await client.query(
      `SELECT * FROM markets WHERE id = $1 FOR UPDATE`,
      [marketId]
    );
    if (marketRes.rows.length === 0) {
      throw new Error(`Market ${marketId} not found`);
    }
    const market = marketRes.rows[0];
    if (market.status === 'SETTLED') {
      throw new Error(`Market ${marketId} is already settled`);
    }

    await client.query(
      `UPDATE markets SET status = 'SETTLED', winning_selection_id = $1, is_locked = TRUE, updated_at = NOW() WHERE id = $2`,
      [winningSelectionId, marketId]
    );

    // 2. Fetch admin user (for commission deposit)
    const adminRes = await client.query(
      `SELECT id, available_credit FROM users WHERE role = 'ADMIN' ORDER BY created_at ASC LIMIT 1 FOR UPDATE`
    );
    const admin = adminRes.rows[0];

    // 3. Fetch all active or matched bets on this market
    const betsRes = await client.query(
      `SELECT * FROM bets WHERE market_id = $1 AND status IN ('MATCHED', 'PARTIALLY_MATCHED', 'UNMATCHED') FOR UPDATE`,
      [marketId]
    );

    // Group bets by user
    const userBetsMap: Record<string, any[]> = {};
    for (const b of betsRes.rows) {
      if (!userBetsMap[b.user_id]) {
        userBetsMap[b.user_id] = [];
      }
      userBetsMap[b.user_id].push(b);
    }

    let totalVolume = 0;
    let totalCommission = 0;

    // 4. Process each user's market settlement
    for (const [userId, bets] of Object.entries(userBetsMap)) {
      const userRes = await client.query(
        `SELECT id, username, available_credit, exposure FROM users WHERE id = $1 FOR UPDATE`,
        [userId]
      );
      if (userRes.rows.length === 0) continue;
      const user = userRes.rows[0];

      // Calculate pre-settlement locked exposure on this market
      const initialExp = await calculateMarketExposure(client, userId, marketId);
      const userMarketExposure = initialExp.netExposure;

      let netMarketPnL = 0;

      for (const bet of bets) {
        const betMatchedStake = parseFloat(bet.matched_stake || bet.stake);
        const betPrice = parseFloat(bet.price);
        const isWinner = parseInt(bet.selection_id, 10) === winningSelectionId;
        let betPnL = 0;

        if (bet.status === 'UNMATCHED') {
          // Unmatched bets have zero PnL and will just have locked exposure refunded
          betPnL = 0;
          await client.query(
            `UPDATE bets SET status = 'CANCELLED', pnl = 0, settled_at = NOW() WHERE id = $1`,
            [bet.id]
          );
        } else {
          // Matched or partially matched
          totalVolume += betMatchedStake;
          if (bet.type === 'BACK') {
            if (isWinner) {
              betPnL = betMatchedStake * (betPrice - 1);
            } else {
              betPnL = -betMatchedStake;
            }
          } else if (bet.type === 'LAY') {
            if (isWinner) {
              betPnL = -betMatchedStake * (betPrice - 1);
            } else {
              betPnL = betMatchedStake;
            }
          }

          await client.query(
            `UPDATE bets SET status = 'SETTLED', pnl = $1, settled_at = NOW() WHERE id = $2`,
            [Math.round(betPnL * 100) / 100, bet.id]
          );

          netMarketPnL += betPnL;
        }
      }

      netMarketPnL = Math.round(netMarketPnL * 100) / 100;

      // Settlement Payout and Liability Release Logic:
      let userPayout = userMarketExposure; // return previously reserved exposure
      let commissionDeducted = 0;

      if (netMarketPnL > 0) {
        commissionDeducted = Math.round(netMarketPnL * commissionRate * 100) / 100;
        const netWin = netMarketPnL - commissionDeducted;
        userPayout += netWin;
        totalCommission += commissionDeducted;

        // Ledger Entry for user win
        const winRef = `WIN_${marketId}_${userId.slice(0, 6)}`;
        await client.query(
          `INSERT INTO ledger_entries (sender_id, receiver_id, amount, transaction_type, reference_id, notes)
           VALUES ($1, $2, $3, 'BET_SETTLEMENT_WIN', $4, $5)`,
          [admin ? admin.id : null, userId, netWin, winRef, `Net winnings on market ${marketId} (PnL: +${netMarketPnL}, Commission: -${commissionDeducted})`]
        );

        // Ledger Entry for operator rake
        if (admin && commissionDeducted > 0) {
          const commRef = `COMM_${marketId}_${userId.slice(0, 6)}`;
          await client.query(
            `INSERT INTO ledger_entries (sender_id, receiver_id, amount, transaction_type, reference_id, notes)
             VALUES ($1, $2, $3, 'COMMISSION_RAKE', $4, $5)`,
            [userId, admin.id, commissionDeducted, commRef, `Exchange commission rake (${(commissionRate * 100).toFixed(1)}%) from ${user.username}`]
          );
        }
      } else if (netMarketPnL < 0) {
        // User lost netMarketPnL: liability absorbed
        // If the user's actual loss was less than the worst-case exposure lock, refund difference
        const actualLoss = Math.abs(netMarketPnL);
        userPayout = Math.max(0, userMarketExposure - actualLoss);
      }

      // Update user balances: reduce exposure, credit payout
      const newAvail = Math.round((parseFloat(user.available_credit) + userPayout) * 100) / 100;
      const newExposure = Math.max(0, Math.round((parseFloat(user.exposure) - userMarketExposure) * 100) / 100);

      await client.query(
        `UPDATE users SET available_credit = $1, exposure = $2, updated_at = NOW() WHERE id = $3`,
        [newAvail, newExposure, userId]
      );
    }

    // Credit total commission to Admin
    if (admin && totalCommission > 0) {
      await client.query(
        `UPDATE users SET available_credit = available_credit + $1, updated_at = NOW() WHERE id = $2`,
        [totalCommission, admin.id]
      );
    }

    return {
      marketId,
      winningSelectionId,
      settledBetsCount: betsRes.rows.length,
      totalVolume: Math.round(totalVolume * 100) / 100,
      totalCommission: Math.round(totalCommission * 100) / 100
    };
  });
}

/**
 * Atomically deposits funds into a user's wallet with immutable double-entry ledger auditing.
 */
export async function depositFundsAtomic(
  userId: string,
  amount: number,
  paymentMethod: string = 'INSTANT_UPI',
  referenceId?: string,
  notes?: string
): Promise<{
  transactionId: string;
  amount: number;
  availableCredit: number;
  creditLimit: number;
  paymentMethod: string;
  referenceId: string;
}> {
  if (amount <= 0 || isNaN(amount)) {
    throw new Error('Deposit amount must be greater than zero');
  }

  const roundedAmount = Math.round(amount * 100) / 100;
  const refId = referenceId || `DEP_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return await withTransaction(async (client) => {
    // 1. Fetch and lock user row
    const userRes = await client.query(
      `SELECT id, username, role, credit_limit, available_credit, is_active FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const user = userRes.rows[0];
    if (!user.is_active) {
      throw new Error(`User account ${user.username} is deactivated`);
    }

    const newAvailable = Math.round((parseFloat(user.available_credit) + roundedAmount) * 100) / 100;
    const newCreditLimit = Math.round((parseFloat(user.credit_limit) + roundedAmount) * 100) / 100;

    // 2. Update user balances
    await client.query(
      `UPDATE users SET available_credit = $1, credit_limit = $2, updated_at = NOW() WHERE id = $3`,
      [newAvailable, newCreditLimit, userId]
    );

    // 3. Insert immutable double-entry ledger entry
    const ledgerRes = await client.query(
      `INSERT INTO ledger_entries (sender_id, receiver_id, amount, transaction_type, reference_id, notes)
       VALUES ($1, $2, $3, 'DEPOSIT', $4, $5)
       RETURNING id, created_at`,
      [null, userId, roundedAmount, refId, notes || `Direct Deposit via ${paymentMethod}`]
    );

    return {
      transactionId: ledgerRes.rows[0].id,
      amount: roundedAmount,
      availableCredit: newAvailable,
      creditLimit: newCreditLimit,
      paymentMethod,
      referenceId: refId
    };
  });
}

/**
 * Atomically requests a withdrawal: verifies balance, locks funds, and logs request.
 */
export async function requestWithdrawalAtomic(
  userId: string,
  amount: number,
  payoutMethod: string,
  accountDetails: Record<string, any>,
  notes?: string
): Promise<{
  withdrawalId: string;
  amount: number;
  payoutMethod: string;
  status: string;
  availableCredit: number;
  exposure: number;
}> {
  if (amount <= 0 || isNaN(amount)) {
    throw new Error('Withdrawal amount must be greater than zero');
  }

  const roundedAmount = Math.round(amount * 100) / 100;

  return await withTransaction(async (client) => {
    // 1. Lock user row
    const userRes = await client.query(
      `SELECT id, username, available_credit, exposure, is_active FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const user = userRes.rows[0];
    if (!user.is_active) {
      throw new Error(`User account is deactivated`);
    }

    const currentAvail = parseFloat(user.available_credit);
    if (currentAvail < roundedAmount) {
      throw new Error(`Insufficient available balance (Available: ₹${currentAvail.toFixed(2)}, Requested: ₹${roundedAmount.toFixed(2)})`);
    }

    const newAvail = Math.round((currentAvail - roundedAmount) * 100) / 100;

    // 2. Lock requested amount from available credit
    await client.query(
      `UPDATE users SET available_credit = $1, updated_at = NOW() WHERE id = $2`,
      [newAvail, userId]
    );

    // 3. Create withdrawal request record
    const withdrawRes = await client.query(
      `INSERT INTO withdrawals (user_id, amount, payout_method, account_details, status, notes)
       VALUES ($1, $2, $3, $4, 'PENDING', $5)
       RETURNING id, status, created_at`,
      [userId, roundedAmount, payoutMethod, JSON.stringify(accountDetails), notes || `Withdrawal request to ${payoutMethod}`]
    );

    const withdrawalId = withdrawRes.rows[0].id;

    // 4. Record ledger entry
    await client.query(
      `INSERT INTO ledger_entries (sender_id, receiver_id, amount, transaction_type, reference_id, notes)
       VALUES ($1, $2, $3, 'WITHDRAWAL_PENDING', $4, $5)`,
      [userId, null, roundedAmount, withdrawalId, `Withdrawal request pending admin approval (${payoutMethod})`]
    );

    return {
      withdrawalId,
      amount: roundedAmount,
      payoutMethod,
      status: 'PENDING',
      availableCredit: newAvail,
      exposure: parseFloat(user.exposure)
    };
  });
}

/**
 * Approves or rejects a withdrawal request atomically.
 */
export async function processWithdrawalAtomic(
  withdrawalId: string,
  processorId: string,
  action: 'APPROVE' | 'REJECT',
  txReference?: string,
  notes?: string
): Promise<{
  withdrawalId: string;
  status: string;
  amount: number;
  userId: string;
}> {
  return await withTransaction(async (client) => {
    // 1. Lock withdrawal row
    const wRes = await client.query(
      `SELECT id, user_id, amount, payout_method, status FROM withdrawals WHERE id = $1 FOR UPDATE`,
      [withdrawalId]
    );

    if (wRes.rows.length === 0) {
      throw new Error(`Withdrawal request with ID ${withdrawalId} not found`);
    }

    const withdrawal = wRes.rows[0];
    if (withdrawal.status !== 'PENDING') {
      throw new Error(`Withdrawal has already been ${withdrawal.status.toLowerCase()}`);
    }

    const amount = parseFloat(withdrawal.amount);
    const targetUserId = withdrawal.user_id;

    if (action === 'APPROVE') {
      // Finalize withdrawal
      await client.query(
        `UPDATE withdrawals
         SET status = 'APPROVED', processed_by = $1, reference_id = $2, notes = $3, processed_at = NOW()
         WHERE id = $4`,
        [processorId, txReference || `TX_${Date.now()}`, notes || 'Approved & Dispatched', withdrawalId]
      );

      // Reduce user credit_limit to reflect permanent fund outflow
      await client.query(
        `UPDATE users SET credit_limit = GREATEST(0, credit_limit - $1), updated_at = NOW() WHERE id = $2`,
        [amount, targetUserId]
      );

      // Ledger entry for completed payout
      await client.query(
        `INSERT INTO ledger_entries (sender_id, receiver_id, amount, transaction_type, reference_id, notes)
         VALUES ($1, $2, $3, 'WITHDRAWAL_COMPLETED', $4, $5)`,
        [targetUserId, null, amount, withdrawalId, `Withdrawal approved & dispatched via ${withdrawal.payout_method}`]
      );

      return {
        withdrawalId,
        status: 'APPROVED',
        amount,
        userId: targetUserId
      };
    } else {
      // REJECT: Refund amount back to user's available balance
      await client.query(
        `UPDATE withdrawals
         SET status = 'REJECTED', processed_by = $1, notes = $2, processed_at = NOW()
         WHERE id = $3`,
        [processorId, notes || 'Rejected by operator', withdrawalId]
      );

      await client.query(
        `UPDATE users SET available_credit = available_credit + $1, updated_at = NOW() WHERE id = $2`,
        [amount, targetUserId]
      );

      // Ledger entry for refund
      await client.query(
        `INSERT INTO ledger_entries (sender_id, receiver_id, amount, transaction_type, reference_id, notes)
         VALUES ($1, $2, $3, 'WITHDRAWAL_REFUND', $4, $5)`,
        [null, targetUserId, amount, withdrawalId, `Withdrawal rejected: funds returned to available balance (${notes || 'Operator rejection'})`]
      );

      return {
        withdrawalId,
        status: 'REJECTED',
        amount,
        userId: targetUserId
      };
    }
  });
}

/**
 * Fetches user transaction history across all ledger activity.
 */
export async function getUserTransactions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  transactions: any[];
  total: number;
}> {
  const countRes = await pool.query(
    `SELECT COUNT(*) as count FROM ledger_entries WHERE sender_id = $1 OR receiver_id = $1`,
    [userId]
  );
  const total = parseInt(countRes.rows[0].count, 10);

  const txRes = await pool.query(
    `SELECT l.id, l.sender_id, l.receiver_id, l.amount, l.transaction_type, l.reference_id, l.notes, l.created_at,
            su.username as sender_username, ru.username as receiver_username
     FROM ledger_entries l
     LEFT JOIN users su ON l.sender_id = su.id
     LEFT JOIN users ru ON l.receiver_id = ru.id
     WHERE l.sender_id = $1 OR l.receiver_id = $1
     ORDER BY l.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return {
    transactions: txRes.rows,
    total
  };
}

/**
 * Fetches withdrawals list for admin/agent oversight or player audit.
 */
export async function getWithdrawalsList(
  status?: string,
  userId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  withdrawals: any[];
  total: number;
}> {
  let whereClauses: string[] = [];
  let params: any[] = [];
  let pIdx = 1;

  if (status) {
    whereClauses.push(`w.status = $${pIdx++}`);
    params.push(status);
  }

  if (userId) {
    whereClauses.push(`w.user_id = $${pIdx++}`);
    params.push(userId);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRes = await pool.query(
    `SELECT COUNT(*) as count FROM withdrawals w ${whereSql}`,
    params
  );
  const total = parseInt(countRes.rows[0].count, 10);

  const listRes = await pool.query(
    `SELECT w.id, w.user_id, w.amount, w.payout_method, w.account_details, w.status,
            w.processed_by, w.reference_id, w.notes, w.created_at, w.processed_at,
            u.username, u.role, pu.username as processor_username
     FROM withdrawals w
     JOIN users u ON w.user_id = u.id
     LEFT JOIN users pu ON w.processed_by = pu.id
     ${whereSql}
     ORDER BY w.created_at DESC
     LIMIT $${pIdx++} OFFSET $${pIdx++}`,
    [...params, limit, offset]
  );

  return {
    withdrawals: listRes.rows,
    total
  };
}

/**
 * Submits a new deposit request from player with UTR reference and payment details.
 */
export async function submitDepositRequestAtomic(params: {
  userId: string;
  amount: number;
  paymentMethod: string;
  utrReference: string;
  paymentMethodId?: string;
  depositAccountDetails?: Record<string, any>;
  proofImageUrl?: string;
  notes?: string;
}): Promise<{
  depositId: string;
  amount: number;
  paymentMethod: string;
  utrReference: string;
  status: string;
  createdAt: string;
}> {
  const {
    userId,
    amount,
    paymentMethod,
    utrReference,
    paymentMethodId,
    depositAccountDetails,
    proofImageUrl,
    notes
  } = params;

  if (amount <= 0 || isNaN(amount)) {
    throw new Error('Valid deposit amount greater than zero is required');
  }

  if (!utrReference || !utrReference.trim()) {
    throw new Error('Valid 12-digit UPI UTR or Transaction Reference number is required');
  }

  const roundedAmount = Math.round(amount * 100) / 100;
  const cleanUtr = utrReference.trim();

  // Check if UTR is already submitted
  const existingUtr = await pool.query(
    `SELECT id, status FROM deposits WHERE utr_reference = $1 AND status IN ('PENDING', 'APPROVED') LIMIT 1`,
    [cleanUtr]
  );
  if (existingUtr.rows.length > 0) {
    throw new Error(`UTR reference '${cleanUtr}' has already been submitted (status: ${existingUtr.rows[0].status})`);
  }

  // Validate user is active
  const userCheck = await pool.query(`SELECT id, username, is_active FROM users WHERE id = $1`, [userId]);
  if (userCheck.rows.length === 0) {
    throw new Error('User account not found');
  }
  if (!userCheck.rows[0].is_active) {
    throw new Error('User account is deactivated');
  }

  const insertRes = await pool.query(
    `INSERT INTO deposits (
      user_id, payment_method_id, payment_method, amount, utr_reference,
      deposit_account_details, status, proof_image_url, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, $8)
    RETURNING id, amount, payment_method, utr_reference, status, created_at`,
    [
      userId,
      paymentMethodId || null,
      paymentMethod,
      roundedAmount,
      cleanUtr,
      depositAccountDetails ? JSON.stringify(depositAccountDetails) : null,
      proofImageUrl || null,
      notes || `Player deposit submission via ${paymentMethod}`
    ]
  );

  const row = insertRes.rows[0];

  return {
    depositId: row.id,
    amount: parseFloat(row.amount),
    paymentMethod: row.payment_method,
    utrReference: row.utr_reference,
    status: row.status,
    createdAt: row.created_at
  };
}

/**
 * Atomically approves or rejects a player deposit request.
 * If approved: atomically updates available_credit & credit_limit, records double-entry ledger entry.
 */
export async function processDepositAtomic(
  depositId: string,
  processorId: string,
  action: 'APPROVE' | 'REJECT',
  notes?: string
): Promise<{
  depositId: string;
  status: string;
  amount: number;
  userId: string;
  username: string;
  availableCredit?: number;
  creditLimit?: number;
}> {
  return await withTransaction(async (client) => {
    // 1. Lock deposit row
    const depRes = await client.query(
      `SELECT d.id, d.user_id, d.amount, d.payment_method, d.utr_reference, d.status, u.username
       FROM deposits d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = $1 FOR UPDATE`,
      [depositId]
    );

    if (depRes.rows.length === 0) {
      throw new Error(`Deposit request with ID ${depositId} not found`);
    }

    const deposit = depRes.rows[0];
    if (deposit.status !== 'PENDING') {
      throw new Error(`Deposit request has already been ${deposit.status.toLowerCase()}`);
    }

    const amount = parseFloat(deposit.amount);
    const targetUserId = deposit.user_id;

    if (action === 'APPROVE') {
      // 2. Lock user row
      const userRes = await client.query(
        `SELECT id, username, available_credit, credit_limit, is_active FROM users WHERE id = $1 FOR UPDATE`,
        [targetUserId]
      );

      if (userRes.rows.length === 0) {
        throw new Error('Target user account not found');
      }

      const user = userRes.rows[0];
      const newAvail = Math.round((parseFloat(user.available_credit) + amount) * 100) / 100;
      const newLimit = Math.round((parseFloat(user.credit_limit) + amount) * 100) / 100;

      // 3. Update user balances
      await client.query(
        `UPDATE users SET available_credit = $1, credit_limit = $2, updated_at = NOW() WHERE id = $3`,
        [newAvail, newLimit, targetUserId]
      );

      // 4. Update deposit status
      await client.query(
        `UPDATE deposits
         SET status = 'APPROVED', processed_by = $1, notes = $2, processed_at = NOW()
         WHERE id = $3`,
        [processorId, notes || `Approved & Credited by Admin (UTR: ${deposit.utr_reference})`, depositId]
      );

      // 5. Insert double-entry ledger entry
      await client.query(
        `INSERT INTO ledger_entries (sender_id, receiver_id, amount, transaction_type, reference_id, notes)
         VALUES ($1, $2, $3, 'DEPOSIT', $4, $5)`,
        [
          null,
          targetUserId,
          amount,
          deposit.utr_reference,
          notes || `Deposit approved: ₹${amount.toFixed(2)} via ${deposit.payment_method} (UTR: ${deposit.utr_reference})`
        ]
      );

      return {
        depositId,
        status: 'APPROVED',
        amount,
        userId: targetUserId,
        username: user.username,
        availableCredit: newAvail,
        creditLimit: newLimit
      };
    } else {
      // REJECT
      await client.query(
        `UPDATE deposits
         SET status = 'REJECTED', processed_by = $1, notes = $2, processed_at = NOW()
         WHERE id = $3`,
        [processorId, notes || 'Deposit request rejected by operator', depositId]
      );

      return {
        depositId,
        status: 'REJECTED',
        amount,
        userId: targetUserId,
        username: deposit.username
      };
    }
  });
}

/**
 * Fetches deposits list for Admin oversight or audit filtering.
 */
export async function getDepositsList(
  status?: string,
  userId?: string,
  limit: number = 50,
  offset: number = 0,
  search?: string
): Promise<{
  deposits: any[];
  total: number;
}> {
  let whereClauses: string[] = [];
  let params: any[] = [];
  let pIdx = 1;

  if (status) {
    whereClauses.push(`d.status = $${pIdx++}`);
    params.push(status);
  }

  if (userId) {
    whereClauses.push(`d.user_id = $${pIdx++}`);
    params.push(userId);
  }

  if (search) {
    whereClauses.push(`(d.utr_reference ILIKE $${pIdx} OR u.username ILIKE $${pIdx})`);
    params.push(`%${search}%`);
    pIdx++;
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRes = await pool.query(
    `SELECT COUNT(*) as count FROM deposits d JOIN users u ON d.user_id = u.id ${whereSql}`,
    params
  );
  const total = parseInt(countRes.rows[0].count, 10);

  const listRes = await pool.query(
    `SELECT d.id, d.user_id, d.payment_method_id, d.payment_method, d.amount, d.utr_reference,
            d.deposit_account_details, d.status, d.processed_by, d.proof_image_url, d.notes,
            d.created_at, d.processed_at,
            u.username, u.role, u.available_credit, u.exposure,
            pu.username as processor_username
     FROM deposits d
     JOIN users u ON d.user_id = u.id
     LEFT JOIN users pu ON d.processed_by = pu.id
     ${whereSql}
     ORDER BY d.created_at DESC
     LIMIT $${pIdx++} OFFSET $${pIdx++}`,
    [...params, limit, offset]
  );

  return {
    deposits: listRes.rows,
    total
  };
}

/**
 * Fetches user's own deposits.
 */
export async function getUserDeposits(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  deposits: any[];
  total: number;
}> {
  const countRes = await pool.query(
    `SELECT COUNT(*) as count FROM deposits WHERE user_id = $1`,
    [userId]
  );
  const total = parseInt(countRes.rows[0].count, 10);

  const listRes = await pool.query(
    `SELECT id, amount, payment_method, utr_reference, deposit_account_details, status, proof_image_url, notes, created_at, processed_at
     FROM deposits
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return {
    deposits: listRes.rows,
    total
  };
}

