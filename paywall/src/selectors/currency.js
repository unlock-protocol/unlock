const DECIMAL_PLACES = 2
const SIGNIFICANT_DIGITS = 2
const MINIMUM_THRESHOLD = 0.0001

/**
 * Format currency values, which can be potentially very large, to human-readable strings that are compact
 *
 * This returns 7 tiers of possible representation
 * - less than 1/100 of a value returns 0
 * - between 0.01 and 1 returns a value formatted as 0.XX
 * - between 1 and 1000, returns the number formatted as XXX.YY with no leading zeros
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
  if (currency < MINIMUM_THRESHOLD) return '< 0.0001'
  if (currency < 1)
    return parseFloat(currency.toPrecision(SIGNIFICANT_DIGITS)).toString()
  if (currency >= 1000 && currency < 1e5)
    return Math.round(currency).toLocaleString()
  if (currency >= 1e5 && currency < 1e6)
    return (+(currency / 1e3).toFixed(1)).toLocaleString() + 'k'
  if (currency >= 1e6 && currency < 1e9)
    return (+(currency / 1e6).toFixed(1)).toLocaleString() + 'm'
  if (currency >= 1e9)
    return (+(currency / 1e9).toFixed(1)).toLocaleString() + 'b'
  return currency.toFixed(DECIMAL_PLACES)
}

export default {
  formatCurrency,
}
