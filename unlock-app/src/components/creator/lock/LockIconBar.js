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
  // These 2 transactions, if not mined or confirmed will trigger the display of CreatorLockStatus
  // instead of the regular iconBar
  const blockingTransactions = [
    lockCreationTransaction,
    priceUpdateTransaction,
  ].filter(t => !!t)

  // TODO: move that logic to mapStateToProps
  for (let i = 0; i < blockingTransactions.length; i++) {
    const blockingTransaction = blockingTransactions[i]
    if (['pending', 'submitted'].includes(blockingTransaction.status)) {
      return <CreatorLockStatus lock={lock} status="Submitted" />
    } else if (
      blockingTransaction.status === 'mined' &&
      blockingTransaction.confirmations < config.requiredConfirmations
    ) {
      return (
        <CreatorLockStatus
          lock={lock}
          status="Confirming"
          confirmations={blockingTransaction.confirmations}
        />
      )
    }
  }

  return (
    <StatusBlock>
      <IconBarContainer>
        <IconBar>
          <Buttons.Withdraw
            as="button"
            lock={lock}
            withdrawalTransaction={withdrawalTransaction}
          />
          <Buttons.Edit
            as="button"
            action={() => edit(lock.address)}
            id={`EditLockButton_${lock.address}`}
          />
          {/* Reinstate when we're ready <Buttons.ExportLock /> */}
          <Buttons.Code
            action={toggleCode}
            as="button"
            id={`LockEmbeddCode_${lock.address}`}
          />
        </IconBar>
      </IconBarContainer>
      <SubStatus>
        {withdrawalTransaction &&
          withdrawalTransaction.status === 'submitted' && (
            <React.Fragment>Submitted to Network...</React.Fragment>
          )}
        {withdrawalTransaction &&
          withdrawalTransaction.status === 'mined' &&
          withdrawalTransaction.confirmations <
            config.requiredConfirmations && (
            <React.Fragment>
              Confirming Withdrawal {withdrawalTransaction.confirmations}/
              {config.requiredConfirmations}
            </React.Fragment>
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

const mapStateToProps = ({ transactions }, { lock }) => {
  let withdrawalTransaction = null

  Object.values(transactions).forEach(transaction => {
    if (
      transaction.type === TransactionType.WITHDRAWAL &&
      transaction.lock === lock.address &&
      transaction.confirmations < config.requiredConfirmations
    )
      withdrawalTransaction = transaction
  })

  let priceUpdateTransaction = null
  Object.values(transactions).forEach(transaction => {
    if (
      transaction.type === TransactionType.UPDATE_KEY_PRICE &&
      transaction.lock === lock.address &&
      transaction.confirmations < config.requiredConfirmations
    ) {
      priceUpdateTransaction = transaction
    }
  })

  const lockCreationTransaction = transactions[lock.transaction]

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
  grid-template-columns: repeat(3, 24px);
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
