import React from 'react'
import PropTypes from 'prop-types'
import web3 from 'web3'

/**
 * Component which shows a balance in Eth
 * @param {*} amount: the amount to convert to Eth
 * @param {string} unit: the unit of the amount to convert to Eth
 */
export function Balance({ amount, unit = 'wei' }) {
  const inWei = web3.utils.toWei(amount || '0', unit)
  const inEth = web3.utils.fromWei(inWei, 'ether')
  return (<span>Ξ {inEth}</span>)
}

Balance.propTypes = {
  amount: PropTypes.string,
  unit: PropTypes.string,
}

export default Balance