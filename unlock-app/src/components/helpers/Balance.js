import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import Web3Utils from 'web3-utils'

/**
 * Component which shows a balance in Eth
 * @param {*} amount: the amount to convert to Eth
 * @param {string} unit: the unit of the amount to convert to Eth
 */
export function Balance({ amount, unit = 'wei', conversion = { USD: undefined }, EthComponent = ({ value }) => value }) {
  let inEth
  if (unit === 'wei') {
    const inWei = Web3Utils.toWei(amount || '0', unit)
    inEth = Web3Utils.fromWei(inWei, 'ether')
  } else {
    inEth = +amount
  }
  const ethWithPresentation = BalancePresenter(inEth)
  let convertedUSDValue
  if (!conversion.USD) {
    convertedUSDValue = '---'
  } else {
    convertedUSDValue = BalancePresenter(inEth * conversion.USD)
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
