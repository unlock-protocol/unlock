import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import Web3Utils from 'web3-utils'

/**
 * Component which shows a balance in Eth
 * @param {*} amount: the amount to convert to Eth
 * @param {string} unit: the unit of the amount to convert to Eth
 * @param {object} conversion: a hash of conversion values for ether to currencies
 * @param {function} EthComponent: a React component that displays an ether value
 */
export function Balance({ amount, unit = 'wei', conversion = { USD: undefined }, EthComponent = ({ value }) => value }) {
  let inEth
  if (unit !== 'dollars' && unit !== 'eth') {
    const inWei = Web3Utils.toWei(amount || '0', unit)
    inEth = Web3Utils.fromWei(inWei, 'ether')
  } else {
    inEth = +amount
  }
  const ethWithPresentation = BalancePresenter(inEth, 'ether')
  let convertedUSDValue
  if (!conversion.USD) {
    convertedUSDValue = '---'
  } else {
    convertedUSDValue = BalancePresenter(inEth * conversion.USD, 'dollars')
  }

  return (
    <BalanceWithConversion>
      <Currency>
        <Eth/>
        <BalanceWithUnit>
          <EthComponent value={ethWithPresentation} />
        </BalanceWithUnit>
      </Currency>
      <Currency>
        <USD/>
        <BalanceWithUnit>
          {convertedUSDValue}
        </BalanceWithUnit>
      </Currency>
    </BalanceWithConversion>
  )
}

/**
 * Provide a representation of Eth Balances suitable for the Unlock frontend
 * application.
 * @param {string} eth: An amount of Eth
 * @param {string} currency: currency type, either ether or some real currency like dollars
 */
function BalancePresenter(eth, currency = 'ether'){
  const DECIMAL_PLACES = 2
  const SIGNIFICANT_DIGITS = 2
  const MINIMUM_THRESHOLD = 0.0001

  let numericalEth = Number(eth)

  if (currency !== 'ether') {
    switch(true) {
      case numericalEth < 1 && numericalEth > 0.01:
        return parseFloat(numericalEth.toPrecision(SIGNIFICANT_DIGITS))
      case numericalEth < 0.01:
        return '0'
      case numericalEth >= 1000 && numericalEth < 1e5 :
        return Math.round(numericalEth).toLocaleString()
      case numericalEth >= 1e5 && numericalEth < 1e6 :
        return (+((numericalEth/1e3).toFixed(1))).toLocaleString() + 'k'
      case numericalEth >= 1e6 && numericalEth < 1e9 :
        return (+((numericalEth/1e6).toFixed(1))).toLocaleString() + 'm'
      case numericalEth >= 1e9 :
        return (+((numericalEth/1e9).toFixed(1))).toLocaleString() + 'b'
      default:
        return numericalEth.toFixed(DECIMAL_PLACES)
    }
  }
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

export const BalanceWithConversion = styled.div`
  display: flex;
  flex-direction: column;
`

export const Currency = styled.span`
  display: flex;
  flex-direction: row;
  
`

export const CurrencySymbol = styled.span`
  width: 20px;
`

export const Eth = styled(CurrencySymbol)`
  &:before {
    content: "三";
  }
`

export const USD = styled(CurrencySymbol)`
  &:before {
    content: "$";
  }
`

export const BalanceWithUnit = styled.span`
  white-space: nowrap;
  text-transform: uppercase;
`

export default Balance
