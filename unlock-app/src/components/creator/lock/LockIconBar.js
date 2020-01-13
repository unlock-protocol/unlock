import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Buttons from '../../interface/buttons/lock'
import UnlockPropTypes from '../../../propTypes'
import CreatorLockStatus from './CreatorLockStatus'
import Media from '../../../theme/media'
import withConfig from '../../../utils/withConfig'
import { TransactionType } from '../../../unlockTypes'

import configure from '../../../config'

const config = configure()

export function LockIconBar({
  lock,
  priceUpdateTransaction,
  toggleCode,
  lockCreationTransaction,
  withdrawalTransaction,
  config,
  edit,
}) {
  // If there is any blocking transaction, we show the lock as either submitted or confirming
  const blockingTransaction = lockCreationTransaction || priceUpdateTransaction
  if (blockingTransaction) {
    if (!blockingTransaction.confirmations) {
      return <CreatorLockStatus lock={lock} status="Submitted" />
    }
    return (
      <CreatorLockStatus
        lock={lock}
        status="Confirming"
        confirmations={blockingTransaction.confirmations}
      />
    )
  }

  const etherscanAddress = `https://etherscan.io/address/${lock.address}`

  const membersPage = `/members?locks=${lock.address}`

  // Otherwise, we just show the lock icon bar
  return (
    <StatusBlock>
      <IconBarContainer>
        <IconBar>
          <Buttons.Withdraw
            as="button"
            lock={lock}
            withdrawalTransaction={withdrawalTransaction}
          />
          <Buttons.Edit as="button" action={() => edit(lock.address)} />
          {/* Reinstate when we're ready <Buttons.ExportLock /> */}
          <Buttons.Members href={membersPage} />
          <Buttons.AppStore as="button" action={toggleCode} />
          <Buttons.Etherscan target="_blank" href={etherscanAddress} />
        </IconBar>
      </IconBarContainer>
      <SubStatus>
        {withdrawalTransaction && !withdrawalTransaction.confirmations && (
          <>Submitted to Network...</>
        )}
        {withdrawalTransaction && !!withdrawalTransaction.confirmations && (
          <>
            Confirming Withdrawal {withdrawalTransaction.confirmations}/
            {config.requiredConfirmations}
          </>
        )}
      </SubStatus>
    </StatusBlock>
  )
}

LockIconBar.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  toggleCode: PropTypes.func.isRequired,
  edit: PropTypes.func, // this will be required when we wire it up, no-op for now
  lockCreationTransaction: UnlockPropTypes.transaction,
  withdrawalTransaction: UnlockPropTypes.transaction,
  priceUpdateTransaction: UnlockPropTypes.transaction,
  config: UnlockPropTypes.configuration.isRequired,
}

LockIconBar.defaultProps = {
  lockCreationTransaction: null,
  priceUpdateTransaction: null,
  withdrawalTransaction: null,
  edit: () => {},
}

export const mapStateToProps = ({ transactions }, { lock }) => {
  // Get all pending transactions as they will impact how we display the lock
  const lockTransactions = Object.values(transactions)
    .filter(transaction => {
      return (
        [transaction.lock, transaction.to].indexOf(lock.address) > -1 &&
        (!transaction.confirmations ||
          transaction.confirmations < config.requiredConfirmations)
      )
    })
    .sort((t, u) => {
      // We sort in reverse block order so we can get the "latest" transaction first
      if (!t.blockNumber) {
        return 1
      }
      if (!u.blockNumber) {
        return -1
      }
      if (t.blockNumber > u.blockNumber) {
        return -1
      }
      return 1
    })

  // Get lock creation transaction
  const lockCreationTransaction = lockTransactions.find(transaction => {
    return transaction.type === TransactionType.LOCK_CREATION
  })

  // Get latest lock withdrawal transacion
  const withdrawalTransaction = lockTransactions.find(transaction => {
    return transaction.type === TransactionType.WITHDRAWAL
  })

  // Get latest lock price update transacion
  const priceUpdateTransaction = lockTransactions.find(transaction => {
    return transaction.type === TransactionType.UPDATE_KEY_PRICE
  })

  return {
    lockCreationTransaction,
    withdrawalTransaction,
    priceUpdateTransaction,
  }
}

export default withConfig(connect(mapStateToProps)(LockIconBar))

const IconBarContainer = styled.div`
  display: grid;
  justify-items: end;
  padding-right: 24px;
  ${Media.phone`
    display: none;
  `};
`

const IconBar = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(5, 24px);
`

const StatusBlock = styled.div``

const SubStatus = styled.div`
  margin-top: 13px;
  font-size: 10px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: normal;
  color: var(--green);
  text-align: right;
  padding-right: 24px;
`
