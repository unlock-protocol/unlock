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
export const Balance = ({ amount, currency, convertCurrency }) => (
  <BalanceProvider
    convertCurrency={convertCurrency}
    amount={amount}
    render={(ethWithPresentation, convertedUSDValue) => (
      <BalanceWithConversion>
        <Currency>
          {!currency && <Eth />}
          {!!currency && <ERC20 name={currency} />}
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
  currency: PropTypes.string,
}

Balance.defaultProps = {
  amount: null,
  convertCurrency: true,
  currency: '',
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
  min-width: 15px;
  text-align: right;
  padding-right: 0.3em;
  display: inline-block;
`

export const Eth = styled(CurrencySymbol)`
  &:before {
    content: '三';
  }
`
export const ERC20 = styled(CurrencySymbol)`
  &:before {
    content: '${props => props.name}';
  }
`

export const USD = styled(CurrencySymbol)`
  &:before {
    content: '$';
  }
`

export const BalanceWithUnit = styled.span`
  white-space: nowrap;
`

const SubBalance = styled.div`
  font-size: 10px;
  color: var(--darkgrey);
  margin-top: 5px;
`

export default Balance
