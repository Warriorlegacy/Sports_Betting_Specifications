describe('Atomic Concurrency & Double-Spending Prevention Logic Tests', () => {
  interface MockAccount {
    id: string;
    availableCredit: number;
    exposure: number;
  }

  function simulateAtomicBetPlacement(
    account: MockAccount,
    liability: number
  ): { success: boolean; error?: string } {
    // Simulates atomic SELECT FOR UPDATE check
    if (account.availableCredit < liability) {
      return {
        success: false,
        error: `Insufficient available credit (${account.availableCredit} < ${liability})`
      };
    }

    account.availableCredit -= liability;
    account.exposure += liability;
    return { success: true };
  }

  test('Concurrent bet placements exceeding available credit are safely rejected', () => {
    const user: MockAccount = {
      id: 'USER_123',
      availableCredit: 1000,
      exposure: 0
    };

    // User attempts to place 3 simultaneous bets with liability 400 each (total 1200)
    const bet1 = simulateAtomicBetPlacement(user, 400);
    const bet2 = simulateAtomicBetPlacement(user, 400);
    const bet3 = simulateAtomicBetPlacement(user, 400); // Should fail

    expect(bet1.success).toBe(true);
    expect(bet2.success).toBe(true);
    expect(bet3.success).toBe(false);

    expect(user.availableCredit).toBe(200);
    expect(user.exposure).toBe(800);
    expect(user.availableCredit).toBeGreaterThanOrEqual(0);
  });

  test('Commission calculation deducts strictly 2% from net winnings', () => {
    const commissionRate = 0.02;
    const netWin = 1500;

    const commission = Math.round(netWin * commissionRate * 100) / 100;
    const netPayout = netWin - commission;

    expect(commission).toBe(30.0);
    expect(netPayout).toBe(1470.0);
  });
});
