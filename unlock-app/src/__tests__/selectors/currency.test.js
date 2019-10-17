import { formatCurrency } from '../../selectors/currency'

describe('currency conversion and formatting selectors', () => {
  describe('formatCurrency', () => {
    it('< 0.0001', () => {
      expect.assertions(1)
      expect(formatCurrency('0.00009')).toBe('< 0.0001')
    })
    it('< 0.01', () => {
      expect.assertions(1)
      expect(formatCurrency('0.004')).toBe('0.004')
    })
    it('0.01 to 1', () => {
      expect.assertions(2)
      expect(formatCurrency('0.01')).toBe('0.01')
      expect(formatCurrency('0.991')).toBe('0.99')
    })
    it('1 to 999', () => {
      expect.assertions(2)
      expect(formatCurrency('1')).toBe('1.00')
      expect(formatCurrency('999.99')).toBe('999.99')
    })
    it('1000 to 99,999', () => {
      expect.assertions(2)
      expect(formatCurrency('1000')).toBe('1,000')
      expect(formatCurrency('99999')).toBe('99,999')
    })
    it('100k to 1 million', () => {
      expect.assertions(3)
      expect(formatCurrency('100000')).toBe('100k')
      expect(formatCurrency('100100')).toBe('100.1k')
      expect(formatCurrency('999911')).toBe('999.9k')
    })
    it('1 million to 1 billion', () => {
      expect.assertions(4)
      expect(formatCurrency('1000000')).toBe('1m')
      expect(formatCurrency('1100000')).toBe('1.1m')
      expect(formatCurrency('10000000')).toBe('10m')
      expect(formatCurrency('999900000')).toBe('999.9m')
    })
    it('1 billion+', () => {
      expect.assertions(2)
      expect(formatCurrency('1000000000')).toBe('1b')
      expect(formatCurrency('100000000000')).toBe('100b')
    })
  })
})
