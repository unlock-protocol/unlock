import PropTypes from 'prop-types'
import Web3Utils from 'web3-utils'
import { connect } from 'react-redux'

import UnlockPropTypes from '../../propTypes'
import { formatEth, formatCurrency } from '../../selectors/currency'

/**
 * Render props component which computes the data required to display balance.
 * This is useful to display balance in different ways.
 */
export const BalanceProvider = ({ amount, unit, conversion, render }) => {
  if (typeof amount === 'undefined' || amount === null) {
    return render(' - ', ' - ') || null
  }
  let currency
  if (unit !== 'dollars' && unit !== 'eth') {
    const inWei = Web3Utils.toWei(amount || '0', unit)
    currency = Web3Utils.fromWei(inWei, 'ether')
  } else {
    currency = +amount
  }
  const ethWithPresentation = formatEth(currency)
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
  unit: PropTypes.string,
  conversion: UnlockPropTypes.conversion,
  convertCurrency: PropTypes.bool,
}

BalanceProvider.defaultProps = {
  amount: null,
  unit: 'wei',
  conversion: { USD: undefined },
  convertCurrency: true,
}

function mapStateToProps({ currency: conversion }) {
  return { conversion }
}

export default connect(mapStateToProps)(BalanceProvider)
