import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import {
  LockWrapper,
  LockHeader,
  LockBody,
  LockDetails,
  TransactionStatus,
  LockDetail,
  LockFooter,
} from './LockStyles'
import BalanceProvider from '../helpers/BalanceProvider'
import withConfig from '../../utils/withConfig'
import { currencySymbolForLock } from '../../utils/locks'

export const PendingKeyLock = ({ lock, config }) => {
  const convertCurrency = !lock.currencyContractAddress
  let currency = currencySymbolForLock(lock, config)

  return (
    <LockWrapper lock={lock}>
      <LockHeader>{lock.name}</LockHeader>
      <Body>
        <BalanceProvider
          convertCurrency={convertCurrency}
          amount={lock.keyPrice}
          render={(ethPrice, fiatPrice) => (
            <React.Fragment>
              <LockDetails>
                <LockDetail bold>
                  {ethPrice} {currency}
                </LockDetail>
                {convertCurrency && <LockDetail>${fiatPrice}</LockDetail>}
              </LockDetails>
            </React.Fragment>
          )}
        />
        <TransactionStatus>Waiting for mining confirmation.</TransactionStatus>
        <Footer>Payment Sent</Footer>
      </Body>
    </LockWrapper>
  )
}

PendingKeyLock.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
}

export default withConfig(PendingKeyLock)

const Footer = styled(LockFooter)`
  background-color: var(--link);
  color: var(--white);
  margin-top: 13px;
`

const Body = styled(LockBody)`
  border: 1px solid var(--link);
`
