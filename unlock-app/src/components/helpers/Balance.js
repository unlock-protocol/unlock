import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'

import BalanceProvider from './BalanceProvider'

/**
 * Component which shows a balance in Eth using default styles.
 * use the BalanceProvider
 * @param {*} amount: the amount to convert to Eth
 * @param {boolean} convertCurrency: show the converted value
 */
export const Balance = ({ amount, convertCurrency }) => (
  <BalanceProvider
    amount={amount}
    render={(ethWithPresentation, convertedUSDValue) => (
      <BalanceWithConversion>
        <Currency>
          <Eth />
          <BalanceWithUnit>{ethWithPresentation}</BalanceWithUnit>
        </Currency>
        {convertCurrency ? (
          <SubBalance>
            <Currency>
              <USD />
              <BalanceWithUnit>{convertedUSDValue}</BalanceWithUnit>
            </Currency>
          </SubBalance>
        ) : (
          ''
        )}
      </BalanceWithConversion>
    )}
  />
)

Balance.propTypes = {
  amount: PropTypes.string,
  convertCurrency: PropTypes.bool,
}

Balance.defaultProps = {
  amount: null,
  convertCurrency: true,
}

export const BalanceWithConversion = styled.div`
  display: flex;
  flex-direction: column;
`

export const Currency = styled.span.attrs({
  className: 'currency',
})`
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
    content: '三';
  }
`

export const USD = styled(CurrencySymbol)`
  &:before {
    content: '$';
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

export default Balance
