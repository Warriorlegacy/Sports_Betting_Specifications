import { OrderBook, Order } from './orderbook';

export class MatchingEngine {
  private books: Map<string, OrderBook> = new Map();

  public getOrCreateBook(marketId: string, selectionId: number): OrderBook {
    const key = `${marketId}:${selectionId}`;
    if (!this.books.has(key)) {
      this.books.set(key, new OrderBook(marketId, selectionId));
    }
    return this.books.get(key)!;
  }

  public processOrder(order: Order) {
    const book = this.getOrCreateBook(order.marketId, order.selectionId);
    return book.placeOrder(order);
  }

  public cancelOrder(marketId: string, selectionId: number, orderId: string): boolean {
    const key = `${marketId}:${selectionId}`;
    const book = this.books.get(key);
    if (!book) return false;
    return book.cancelOrder(orderId);
  }
}

export const globalEngine = new MatchingEngine();

if (require.main === module) {
  console.log('Standalone Sports Exchange Matching Engine service initialized.');
}
