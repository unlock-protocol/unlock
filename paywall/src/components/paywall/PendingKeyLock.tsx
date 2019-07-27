import React from 'react'
import styled from 'styled-components'
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
import { Lock, UnlockConfig } from '../../unlockTypes'

interface PendingKeyLockProps {
  lock: Lock
  config: UnlockConfig
}

export const PendingKeyLock = ({ lock, config }: PendingKeyLockProps) => {
  const convertCurrency = !lock.currencyContractAddress
  let currency = currencySymbolForLock(lock, config)

  return (
    <LockWrapper lock={lock}>
      <LockHeader>{lock.name}</LockHeader>
      <Body>
        <BalanceProvider
          convertCurrency={convertCurrency}
          amount={lock.keyPrice}
          render={(ethPrice: string, fiatPrice: string) => (
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

export default withConfig(PendingKeyLock)

const Footer = styled(LockFooter)`
  background-color: var(--link);
  color: var(--white);
  margin-top: 13px;
`

const Body = styled(LockBody)`
  border: 1px solid var(--link);
`
