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

export const PendingKeyLock = ({ lock }) => (
  <LockWrapper>
    <LockHeader>{lock.name}</LockHeader>
    <Body>
      <BalanceProvider
        amount={lock.keyPrice}
        render={(ethPrice, fiatPrice) => (
          <React.Fragment>
            <LockDetails>
              <LockDetail bold>{ethPrice} ETH</LockDetail>
              <LockDetail>${fiatPrice}</LockDetail>
            </LockDetails>
          </React.Fragment>
        )}
      />
      <TransactionStatus>Waiting for mining confirmation.</TransactionStatus>
      <Footer>Payment Sent</Footer>
    </Body>
  </LockWrapper>
)

PendingKeyLock.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export default PendingKeyLock

const Footer = styled(LockFooter)`
  background-color: var(--link);
  color: var(--white);
  margin-top: 13px;
`

const Body = styled(LockBody)`
  border: 1px solid var(--link);
`
