import { OrderBook, Order } from '../src/orderbook';

describe('OrderBook Matching Algorithm Tests', () => {
  let book: OrderBook;

  beforeEach(() => {
    book = new OrderBook('MKT_TEST_01', 1);
  });

  test('Back order matches against existing Lay order with price improvement', () => {
    // 1. Layer offers price 2.10, stake 100
    const layOrder: Order = {
      id: 'LAY_01',
      userId: 'USER_A',
      marketId: 'MKT_TEST_01',
      selectionId: 1,
      type: 'LAY',
      price: 2.10,
      stake: 100,
      matchedStake: 0,
      timestamp: 1000
    };
    const layMatches = book.placeOrder(layOrder);
    expect(layMatches.length).toBe(0); // Rest in book

    // 2. Backer enters with price 2.20, stake 100
    const backOrder: Order = {
      id: 'BACK_01',
      userId: 'USER_B',
      marketId: 'MKT_TEST_01',
      selectionId: 1,
      type: 'BACK',
      price: 2.20,
      stake: 100,
      matchedStake: 0,
      timestamp: 2000
    };
    const backMatches = book.placeOrder(backOrder);

    expect(backMatches.length).toBe(1);
    expect(backMatches[0].matchedPrice).toBe(2.10); // Match at best available price
    expect(backMatches[0].matchedStake).toBe(100);
    expect(backOrder.matchedStake).toBe(100);
    expect(layOrder.matchedStake).toBe(100);

    const depth = book.getDepth();
    expect(depth.backs.length).toBe(0);
    expect(depth.lays.length).toBe(0);
  });

  test('Partial fill leaves residual stake in book', () => {
    // Layer offers 50 stake at 1.90
    const layOrder: Order = {
      id: 'LAY_02',
      userId: 'USER_A',
      marketId: 'MKT_TEST_01',
      selectionId: 1,
      type: 'LAY',
      price: 1.90,
      stake: 50,
      matchedStake: 0,
      timestamp: 1000
    };
    book.placeOrder(layOrder);

    // Backer requests 100 stake at 1.90
    const backOrder: Order = {
      id: 'BACK_02',
      userId: 'USER_B',
      marketId: 'MKT_TEST_01',
      selectionId: 1,
      type: 'BACK',
      price: 1.90,
      stake: 100,
      matchedStake: 0,
      timestamp: 2000
    };
    const matches = book.placeOrder(backOrder);

    expect(matches.length).toBe(1);
    expect(matches[0].matchedStake).toBe(50);
    expect(backOrder.matchedStake).toBe(50);

    // Residual 50 stake remains in Back book
    const depth = book.getDepth();
    expect(depth.backs.length).toBe(1);
    expect(depth.backs[0].price).toBe(1.90);
    expect(depth.backs[0].size).toBe(50);
    expect(depth.lays.length).toBe(0);
  });
});
