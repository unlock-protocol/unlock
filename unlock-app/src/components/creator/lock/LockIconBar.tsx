import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import Buttons from '../../interface/buttons/lock'
import UnlockPropTypes from '../../../propTypes'
import CreatorLockStatus from './CreatorLockStatus'
import withConfig, { ConfigContext } from '../../../utils/withConfig'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

interface LockIconBarProps {
  lock: any
  withdraw: any
  toggleCode: () => void
  toggleCreditCard: () => void
}
export function LockIconBar({
  lock,
  toggleCode,
  withdraw,
  toggleCreditCard,
}: LockIconBarProps) {
  const config = useContext(ConfigContext)
  const { network } = useContext(AuthenticationContext)

  // If there is any blocking transaction, we show the lock as either submitted or confirming
  const hasBlockingTransaction =
    lock?.transactions && Object.keys(lock?.transactions).length > 0
  if (hasBlockingTransaction) {
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
  const { explorer } = config.networks[network!] ?? {}
  // Otherwise, we just show the lock icon bar
  return (
    <div
      className="flex flex-wrap justify-around"
      style={{
        maxWidth: '250px',
      }}
    >
      <Buttons.CreditCard as="button" lock={lock} action={toggleCreditCard} />
      <Buttons.Withdraw as="button" lock={lock} withdraw={withdraw} />
      <Buttons.Demo
        as="a"
        href={`/demo?network=${network}&lock=${lock.address}`}
        target="_blank"
      />
      <Buttons.Members href={membersPage} />
      <Buttons.AppStore as="button" action={toggleCode} />
      {explorer && (
        <Buttons.Explorer
          target="_blank"
          href={explorer.urls.address(lock.address)}
        />
      )}
      <Buttons.Verifiers as="a" href={verifiersPage} />
    </div>
  )
}

LockIconBar.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  toggleCode: PropTypes.func.isRequired,
  toggleCreditCard: PropTypes.func.isRequired,
  withdraw: PropTypes.func.isRequired,
}
export default withConfig(LockIconBar)
