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
  LockName,
} from './LockStyles'
import BalanceProvider from '../helpers/BalanceProvider'

export const PendingKeyLock = ({ lock }) => (
  <LockWrapper>
    <Header>Payment sent</Header>
    <LockBody>
      <TransactionStatus>Waiting for mining confirmation.</TransactionStatus>

      <BalanceProvider
        amount={lock.keyPrice}
        render={(ethPrice, fiatPrice) => (
          <>
            <LockName>{lock.name}</LockName>
            <LockDetails>
              <LockDetail bold>
                {ethPrice}
                {' '}
ETH
              </LockDetail>
              <LockDetail>
$
                {fiatPrice}
              </LockDetail>
            </LockDetails>
          </>
        )}
      />
    </LockBody>
  </LockWrapper>
)

PendingKeyLock.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export default PendingKeyLock

const Header = styled(LockHeader)`
  background-color: var(--link);
  color: var(--offwhite);
`
