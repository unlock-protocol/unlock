import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import Web3Utils from 'web3-utils'
import { connect } from 'react-redux'

import UnlockPropTypes from '../../propTypes'
import { formatEth, formatCurrency } from '../../selectors/currency'

/**
 * Component which shows a balance in Eth
 * @param {*} amount: the amount to convert to Eth
 * @param {string} unit: the unit of the amount to convert to Eth
 * @param {object} conversion: a hash of conversion values for ether to currencies
 * @param {function} EthComponent: a React component that displays an ether value
 */
export function Balance({ amount, unit, conversion, EthComponent, convertCurrency }) {
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

  return (
    <BalanceWithConversion>
      <Currency>
        <Eth />
        <BalanceWithUnit>
          <EthComponent value={ethWithPresentation} />
        </BalanceWithUnit>
      </Currency>
      { convertCurrency ?
        <SubBalance>
          <Currency>
            <USD />
            <BalanceWithUnit>
              {convertedUSDValue}
            </BalanceWithUnit>
          </Currency>
        </SubBalance>:
        '' }
    </BalanceWithConversion>
  )
}

Balance.propTypes = {
  amount: PropTypes.string.isRequired,
  unit: PropTypes.string,
  conversion: UnlockPropTypes.conversion,
  EthComponent: PropTypes.func,
  convertCurrency: PropTypes.bool,
}

Balance.defaultProps = {
  unit: 'wei',
  conversion: { USD: undefined },
  EthComponent: ({ value }) => value,
  convertCurrency: true,
}

export const BalanceWithConversion = styled.div`
  display: flex;
  flex-direction: column;
`

export const Currency = styled.span`
  display: flex;
  flex-direction: row;
  padding-bottom: 0.5em;
`

export const CurrencySymbol = styled.span`
  width: 1.3em;
  text-align: right;
  padding-right: 0.5em;

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

const SubBalance = styled.div`
  font-size: 10px;
  color: var(--darkgrey);
  margin-top: 5px;
`

function mapStateToProps({ currency: conversion }) {
  return { conversion }
}

export default connect(mapStateToProps)(Balance)
