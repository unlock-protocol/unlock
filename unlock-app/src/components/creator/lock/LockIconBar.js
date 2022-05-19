import React, { useContext } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import Buttons from '../../interface/buttons/lock'
import UnlockPropTypes from '../../../propTypes'
import CreatorLockStatus from './CreatorLockStatus'
import Media from '../../../theme/media'
import withConfig, { ConfigContext } from '../../../utils/withConfig'
import { TransactionType, TransactionStatus } from '../../../unlockTypes'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

export function LockIconBar({ lock, toggleCode, withdraw, toggleCreditCard }) {
  const config = useContext(ConfigContext)
  const { network } = useContext(AuthenticationContext)

  // If there is any blocking transaction, we show the lock as either submitted or confirming
  if (lock.transactions && Object.keys(lock.transactions) > 0) {
    // Only take the first one (TODO: support for multiple?)
    const transactionHash = Object.keys(lock.transactions)[0]
    const transaction = lock.transactions[transactionHash]
    return (
      <CreatorLockStatus
        confirmations={transaction.confirmations}
        hash={transactionHash}
        lock={lock}
      />
    )
  }
  const membersPage = `/members?locks=${lock.address}`
  const verifiersPage = `/verifiers?lockAddress=${lock.address}`
  // Otherwise, we just show the lock icon bar
  return (
    <StatusBlock>
      <IconBar>
        <Buttons.CreditCard as="button" lock={lock} action={toggleCreditCard} />
        <Buttons.Withdraw as="button" lock={lock} withdraw={withdraw} />
        <Buttons.Demo
          as="a"
          href={`/demo?network=${network}&lock=${lock.address}`}
          target="_blank"
        />
        <Buttons.Members href={membersPage} />
        <Buttons.AppStore as="button" action={toggleCode} />
        {config.networks[network].explorer && (
          <Buttons.Explorer
            target="_blank"
            href={config.networks[network].explorer.urls.address(lock.address)}
          />
        )}
        <Buttons.Verifiers href={verifiersPage} />
      </IconBar>
    </StatusBlock>
  )
}

LockIconBar.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  toggleCode: PropTypes.func.isRequired,
  toggleCreditCard: PropTypes.func.isRequired,
  withdraw: PropTypes.func.isRequired,
}
export default withConfig(LockIconBar)

const IconBar = styled.div`
  display: flex;
  justify-content: space-around;
  ${Media.phone`
    display: none;
  `};
  flex-wrap: wrap;
  max-width: 250px;
`
const StatusBlock = styled.div``
