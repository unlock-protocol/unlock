import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import UnlockPropTypes from '../../propTypes'
import { formatCurrency } from '../../selectors/currency'

/**
 * Render props component which computes the data required to display balance.
 * This is useful to display balance in different ways.
 * amount is always in eth
 */
export const BalanceProvider = ({ amount, conversion, render }) => {
  if (typeof amount === 'undefined' || amount === null) {
    return render(' - ', ' - ') || null
  }
  let currency = parseFloat(amount)
  const ethWithPresentation = formatCurrency(currency)
  let convertedUSDValue
  if (!conversion.USD) {
    convertedUSDValue = '---'
  } else {
    convertedUSDValue = formatCurrency(currency * conversion.USD)
  }
  return render(ethWithPresentation, convertedUSDValue) || null
}

BalanceProvider.propTypes = {
  amount: PropTypes.string,
  conversion: UnlockPropTypes.conversion,
  convertCurrency: PropTypes.bool,
}

BalanceProvider.defaultProps = {
  amount: null,
  conversion: { USD: undefined },
  convertCurrency: true,
}

function mapStateToProps({ currency: conversion }) {
  return { conversion }
}

export default connect(mapStateToProps)(BalanceProvider)
