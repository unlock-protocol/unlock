import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import Buttons from '../../interface/buttons/lock'
import UnlockPropTypes from '../../../propTypes'
import CreatorLockStatus from './CreatorLockStatus'
import Media from '../../../theme/media'
import withConfig from '../../../utils/withConfig'
import { TransactionType, TransactionStatus } from '../../../unlockTypes'

import configure from '../../../config'

const config = configure()

export function LockIconBar({ lock, toggleCode, config, edit }) {
  // If there is any blocking transaction, we show the lock as either submitted or confirming
  const blockingTransaction =
    lock.creationTransaction || lock.priceUpdateTransaction

  if (blockingTransaction) {
    if (blockingTransaction.status !== TransactionStatus.MINED) {
      return (
        <CreatorLockStatus
          hash={blockingTransaction.hash}
          lock={lock}
          status="Submitted"
        />
      )
    }
    if (blockingTransaction.confirmations < config.requiredConfirmations) {
      return (
        <CreatorLockStatus
          lock={lock}
          hash={blockingTransaction.hash}
          status="Confirming"
          confirmations={blockingTransaction.confirmations}
        />
      )
    }
  }

  const etherscanAddress = config.chainExplorerUrlBuilders.etherscan(
    `/address/${lock.address}`
  )

  const membersPage = `/members?locks=${lock.address}`

  const withdrawalTransaction = lock.withdrawalTransaction

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
  config: UnlockPropTypes.configuration.isRequired,
}

LockIconBar.defaultProps = {
  edit: () => {},
}

export default withConfig(LockIconBar)

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
