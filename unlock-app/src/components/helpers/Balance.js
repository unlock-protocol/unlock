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
  let ethWithPresentation = BalancePresenter(inEth)

  return (<BalanceWithUnit>
    三 
    {' '}
    {ethWithPresentation}
  </BalanceWithUnit>)
}

/**
 * Provide a representaion of Eth Balances suitable for the Unlock frontend
 * application.
 * @param {string} eth: An amount of Eth
 */
function BalancePresenter(eth){
  const DECIMAL_PLACES = 2
  const SIGNIFICANT_DIGITS = 2
  const MINIMUM_THRESHOLD = 0.0001

  let numericalEth = Number(eth)

  switch(true) {
  case numericalEth < MINIMUM_THRESHOLD && numericalEth > 0 :
    return '< 0.0001'
  case numericalEth < 1:
    return parseFloat(numericalEth.toPrecision(SIGNIFICANT_DIGITS))
  default:
    return numericalEth.toFixed(DECIMAL_PLACES)
  }
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
