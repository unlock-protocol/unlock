import styled from 'styled-components'
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { ConfigContext } from '../../utils/withConfig'

import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import BalanceProvider from './BalanceProvider'

/**
 * Component which shows a balance in Eth using default styles.
 * use the BalanceProvider
 * @param {*} amount: the amount to convert to Eth
 */
export const Balance = ({ amount, currency }) => {
  const config = useContext(ConfigContext)
  const { network } = useContext(AuthenticationContext)
  const baseCurrencySymbol = config.networks[network].baseCurrencySymbol

  return (
    <BalanceProvider
      amount={amount}
      render={(ethWithPresentation) => (
        <div className="flex flex-col">
          <span className="flex">
            {!currency && <ERC20 name={baseCurrencySymbol} />}
            {!!currency && <ERC20 name={currency} />}
            <span className="whitespace-nowrap">{ethWithPresentation}</span>
          </span>
        </div>
      )}
    />
  )
}

Balance.propTypes = {
  amount: PropTypes.string,
  currency: PropTypes.string,
}

Balance.defaultProps = {
  amount: null,
  currency: '',
}

export const CurrencySymbol = styled.span`
  text-transform: uppercase;
  width: 50px; /* supports 5 characters */
  text-align: right;
  margin-right: 3px;
  display: inline-block;
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

export default Balance
