import PropTypes from 'prop-types'

import { formatCurrency } from '../../selectors/currency'
import useCurrencyConverter from '../../hooks/useCurrencyConverter'

/**
 * Render props component which computes the data required to display balance.
 * This is useful to display balance in different ways.
 * amount is always in eth
 */
export const BalanceProvider = ({ amount, convertCurrency, render }) => {
  const conversion = useCurrencyConverter()

  if (typeof amount === 'undefined' || amount === null) {
    return render(' - ', ' - ') || null
  }

  let currency = parseFloat(amount)
  const ethWithPresentation = formatCurrency(currency)
  let convertedUSDValue

  if (!convertCurrency) {
    return render(ethWithPresentation) || null
  }

  if (!conversion.USD) {
    convertedUSDValue = '---'
  } else {
    convertedUSDValue = formatCurrency(currency * conversion.USD)
  }

  return render(ethWithPresentation, convertedUSDValue) || null
}

BalanceProvider.propTypes = {
  amount: PropTypes.string,
  convertCurrency: PropTypes.bool,
}

BalanceProvider.defaultProps = {
  amount: null,
  convertCurrency: true,
}

export default BalanceProvider
