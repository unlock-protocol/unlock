import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import Web3Utils from 'web3-utils'
import { formatEth, formatCurrency } from '../../selectors/currency'

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
  const ethWithPresentation = formatEth(inEth)
  let convertedUSDValue
  if (!conversion.USD) {
    convertedUSDValue = '---'
  } else {
    convertedUSDValue = formatCurrency(inEth * conversion.USD)
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
