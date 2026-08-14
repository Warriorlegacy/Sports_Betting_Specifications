describe('Multi-Runner Worst-Case Liability & Exposure Calculation Tests', () => {
  /**
   * Helper simulating Betfair worst-case exposure calculation
   */
  function calculateSimulatedExposure(
    selections: number[],
    bets: Array<{ selectionId: number; type: 'BACK' | 'LAY'; price: number; stake: number }>
  ) {
    const pnlMatrix: Record<number, number> = {};

    for (const winner of selections) {
      let outcomePnL = 0;
      for (const bet of bets) {
        const isWinner = bet.selectionId === winner;
        if (bet.type === 'BACK') {
          outcomePnL += isWinner ? bet.stake * (bet.price - 1) : -bet.stake;
        } else {
          outcomePnL += isWinner ? -bet.stake * (bet.price - 1) : bet.stake;
        }
      }
      pnlMatrix[winner] = Math.round(outcomePnL * 100) / 100;
    }

    const minPnL = Math.min(...Object.values(pnlMatrix));
    const worstCaseExposure = minPnL < 0 ? Math.abs(minPnL) : 0;
    return { worstCaseExposure, pnlMatrix };
  }

  test('Single Back bet requires stake as liability', () => {
    // 2-runner market (Selection 1: India, Selection 2: Australia)
    const selections = [1, 2];
    const bets = [{ selectionId: 1, type: 'BACK' as const, price: 1.80, stake: 500 }];

    const { worstCaseExposure, pnlMatrix } = calculateSimulatedExposure(selections, bets);

    // If 1 wins: +400; If 2 wins: -500
    expect(pnlMatrix[1]).toBe(400);
    expect(pnlMatrix[2]).toBe(-500);
    expect(worstCaseExposure).toBe(500);
  });

  test('Single Lay bet requires stake * (price - 1) as liability', () => {
    const selections = [1, 2];
    const bets = [{ selectionId: 1, type: 'LAY' as const, price: 2.20, stake: 500 }];

    const { worstCaseExposure, pnlMatrix } = calculateSimulatedExposure(selections, bets);

    // If 1 wins: -600 (500 * 1.2); If 2 wins: +500
    expect(pnlMatrix[1]).toBe(-600);
    expect(pnlMatrix[2]).toBe(500);
    expect(worstCaseExposure).toBe(600);
  });

  test('Hedging with opposing Back on opposite runner reduces net worst-case exposure', () => {
    const selections = [1, 2];
    // User backs India for 1000 @ 2.00, then backs Australia for 800 @ 2.00
    const bets = [
      { selectionId: 1, type: 'BACK' as const, price: 2.00, stake: 1000 },
      { selectionId: 2, type: 'BACK' as const, price: 2.00, stake: 800 }
    ];

    const { worstCaseExposure, pnlMatrix } = calculateSimulatedExposure(selections, bets);

    // If India wins: +1000 (from India) - 800 (from Australia loss) = +200
    // If Australia wins: -1000 (from India loss) + 800 (from Australia win) = -200
    expect(pnlMatrix[1]).toBe(200);
    expect(pnlMatrix[2]).toBe(-200);
    // Worst case loss is only 200 instead of 1000 + 800 = 1800!
    expect(worstCaseExposure).toBe(200);
  });

  test('Green book (arbitrage) has 0 exposure and guaranteed profit across all outcomes', () => {
    const selections = [1, 2];
    // Back India @ 2.20 for 1000, then Lay India @ 1.80 for 1200
    const bets = [
      { selectionId: 1, type: 'BACK' as const, price: 2.20, stake: 1000 },
      { selectionId: 1, type: 'LAY' as const, price: 1.80, stake: 1200 }
    ];

    const { worstCaseExposure, pnlMatrix } = calculateSimulatedExposure(selections, bets);

    // If India wins: +1200 (Back win) - 960 (Lay loss: 1200 * 0.8) = +240
    // If Australia wins: -1000 (Back loss) + 1200 (Lay win) = +200
    expect(pnlMatrix[1]).toBe(240);
    expect(pnlMatrix[2]).toBe(200);
    expect(worstCaseExposure).toBe(0); // Zero liability locked!
  });
});
