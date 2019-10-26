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
import withConfig from '../../utils/withConfig'
import { currencySymbolForLock } from '../../utils/locks'

export const PendingKeyLock = ({ lock, config }) => {
  let currency = currencySymbolForLock(lock, config)

  return (
    <LockWrapper lock={lock}>
      <LockHeader>{lock.name}</LockHeader>
      <Body>
        <LockDetails>
          <LockDetail bold>
            {lock.keyPrice} {currency}
          </LockDetail>
        </LockDetails>
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
