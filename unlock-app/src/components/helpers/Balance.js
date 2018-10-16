import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import Web3Utils from 'web3-utils'

/**
 * Component which shows a balance in Eth
 * @param {*} amount: the amount to convert to Eth
 * @param {string} unit: the unit of the amount to convert to Eth
 */
export function Balance({ amount, unit = 'wei' }) {
  let inWei = Web3Utils.toWei(amount || '0', unit)
  let inEth = Web3Utils.fromWei(inWei, 'ether')
  return (<BalanceWithUnit>
    三 {inEth}
  </BalanceWithUnit>)
}

Balance.propTypes = {
  amount: PropTypes.string,
  unit: PropTypes.string,
}

export const BalanceWithUnit = styled.span`
  white-space: nowrap;
  text-transform: uppercase;
`

export default Balance
