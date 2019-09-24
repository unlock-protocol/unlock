const MINIMUM_THRESHOLD = 0.001

/**
 * Format currency values, which can be potentially very large, to human-readable strings that are compact
 *
 * This returns 7 tiers of possible representation
 * - less than 1/100 of a value returns 0
 * - between 0.01 and 1 returns a value formatted as 0.XX
 * - between 1 and 100, returns the number formatted as XX.YY with no leading zeros
 * - between 100 and 1000, returns the number formatted as XXX with no leading zeros
 * - between 1000 and 100,000, returns the rounded number as X,XXX or XX,XXX using locale-formatted number
 * - between 100,000 and 1 million, returns XXXk
 * - between 1 million and 1 billion, returns XXX.Ym with no leading zeros
 * - above 1 billion, returna X.Yb
 * @param {string} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  let currency = Number(amount)
  if (currency === 0) return '0'
  if (currency < MINIMUM_THRESHOLD) return '< 0.001'
  if (currency < 1) return parseFloat(currency.toPrecision(2)).toString() // 0.12
  if (currency < 10) return parseFloat(currency.toPrecision(3)).toString() // 1.32
  if (currency < 100) return parseFloat(currency.toPrecision(4)).toString() // 12.32
  if (currency < 1000) return parseFloat(currency.toPrecision(3)).toString() // 123
  if (currency < 1e4) return Math.round(currency).toLocaleString()
  if (currency < 1e6)
    return (+(currency / 1e3).toFixed(1)).toLocaleString() + 'k'
  if (currency < 1e9)
    return (+(currency / 1e6).toFixed(1)).toLocaleString() + 'm'
  return (+(currency / 1e9).toFixed(1)).toLocaleString() + 'b'
}

export default {
  formatCurrency,
}
