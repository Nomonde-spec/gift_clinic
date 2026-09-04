import { calculateStockStatus } from '../src/services/stock.service';

describe('Stock Calculation Unit Tests', () => {
  const threshold = 20;

  it('should return OUT_OF_STOCK when quantity is 0', () => {
    expect(calculateStockStatus(0, threshold)).toBe('OUT_OF_STOCK');
  });

  it('should return OUT_OF_STOCK when quantity is negative', () => {
    expect(calculateStockStatus(-5, threshold)).toBe('OUT_OF_STOCK');
  });

  it('should return LOW_STOCK when quantity is equal to threshold', () => {
    expect(calculateStockStatus(20, threshold)).toBe('LOW_STOCK');
  });

  it('should return LOW_STOCK when quantity is between 1 and threshold', () => {
    expect(calculateStockStatus(1, threshold)).toBe('LOW_STOCK');
    expect(calculateStockStatus(15, threshold)).toBe('LOW_STOCK');
  });

  it('should return IN_STOCK when quantity is greater than threshold', () => {
    expect(calculateStockStatus(21, threshold)).toBe('IN_STOCK');
    expect(calculateStockStatus(100, threshold)).toBe('IN_STOCK');
  });
});
