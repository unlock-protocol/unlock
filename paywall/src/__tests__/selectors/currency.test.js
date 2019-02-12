import { formatCurrency, formatEth } from '../../selectors/currency'

describe('currency conversion and formatting selectors', () => {
  describe('formatEth', () => {
    it('small values', () => {
      expect(formatEth('0.00001')).toBe('< 0.0001')
    })
    it('decimal values', () => {
      expect(formatEth('0.01')).toBe('0.01')
      expect(formatEth('0.99')).toBe('0.99')
      expect(formatEth('0.91111111')).toBe('0.91')
    })
    it('larger values', () => {
      expect(formatEth('2')).toBe('2.00')
      expect(formatEth('22222222')).toBe('22222222.00')
    })
  })
  describe('formatCurrency', () => {
    it('< 0.01', () => {
      expect(formatCurrency('0.004')).toBe('0')
    })
    it('0.01 to 1', () => {
      expect(formatCurrency('0.01')).toBe('0.01')
      expect(formatCurrency('0.991')).toBe('0.99')
    })
    it('1 to 999', () => {
      expect(formatCurrency('1')).toBe('1.00')
      expect(formatCurrency('999.99')).toBe('999.99')
    })
    it('1000 to 99,999', () => {
      expect(formatCurrency('1000')).toBe('1,000')
      expect(formatCurrency('99999')).toBe('99,999')
    })
    it('100k to 1 million', () => {
      expect(formatCurrency('100000')).toBe('100k')
      expect(formatCurrency('100100')).toBe('100.1k')
      expect(formatCurrency('999911')).toBe('999.9k')
    })
    it('1 million to 1 billion', () => {
      expect(formatCurrency('1000000')).toBe('1m')
      expect(formatCurrency('1100000')).toBe('1.1m')
      expect(formatCurrency('10000000')).toBe('10m')
      expect(formatCurrency('999900000')).toBe('999.9m')
    })
    it('1 billion+', () => {
      expect(formatCurrency('1000000000')).toBe('1b')
      expect(formatCurrency('100000000000')).toBe('100b')
    })
  })
})
