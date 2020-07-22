import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'

import BalanceProvider from './BalanceProvider'

/**
 * Component which shows a balance in Eth using default styles.
 * use the BalanceProvider
 * @param {*} amount: the amount to convert to Eth
 */
export const Balance = ({ amount, currency }) => (
  <BalanceProvider
    amount={amount}
    render={(ethWithPresentation) => (
      <BalanceWithConversion>
        <Currency>
          {!currency && <Eth />}
          {!!currency && <ERC20 name={currency} />}
          <BalanceWithUnit>{ethWithPresentation}</BalanceWithUnit>
        </Currency>
      </BalanceWithConversion>
    )}
  />
)

Balance.propTypes = {
  amount: PropTypes.string,
  currency: PropTypes.string,
}

Balance.defaultProps = {
  amount: null,
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
  max-width: 40px; /* supports 4 characters */
  text-align: left;
  padding-right: 0.3em;
  display: inline-block;
`

export const Eth = styled(CurrencySymbol)`
  &:before {
    content: 'Ξ';
    font-family: 'Arial', sans-serif;
  }
`
export const ERC20 = styled(CurrencySymbol)`
  &:before {
    content: '${(props) => props.name}';
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

export default Balance
