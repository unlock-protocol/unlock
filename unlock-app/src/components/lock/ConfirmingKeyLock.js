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
} from './LockStyles'
import BalanceProvider from '../helpers/BalanceProvider'
import withConfig from '../../utils/withConfig'

export const ConfirmingKeyLock = ({ lock, transaction, config }) => (
  <LockWrapper>
    <Header>Payment Received</Header>
    <LockBody>
      <TransactionStatus>
        Waiting for confirmation.
        <br />
        {transaction.confirmations}
/
        {config.requiredConfirmations}
      </TransactionStatus>
      <BalanceProvider
        amount={lock.keyPrice}
        render={(ethPrice, fiatPrice) => (
          <>
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

ConfirmingKeyLock.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  transaction: UnlockPropTypes.transaction.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
}

export default withConfig(ConfirmingKeyLock)

const Header = styled(LockHeader)`
  background-color: var(--green);
  color: var(--offwhite);
`
