import PropTypes from 'prop-types'
/**
 * Render props component which computes the data required to display balance.
 * This is useful to display balance in different ways.
 * amount is always in eth
 */
export const BalanceProvider = ({ amount, render }) => {
  if (typeof amount === 'undefined' || amount === null) {
    return render(' - ', ' - ') || null
  }
  const currency = parseFloat(amount).toFixed(3).replace(/00$/, '')
  const ethWithPresentation = currency
  return render(ethWithPresentation) || null
}

BalanceProvider.propTypes = {
  amount: PropTypes.string,
}

BalanceProvider.defaultProps = {
  amount: null,
}

export default BalanceProvider
