import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import UnlockPropTypes from '../propTypes'
import Overlay from './lock/Overlay'
import DeveloperOverlay from './developer/DeveloperOverlay'
import ShowWhenLocked from './lock/ShowWhenLocked'
import ShowWhenUnlocked from './lock/ShowWhenUnlocked'
import GlobalErrorProvider from '../utils/GlobalErrorProvider'
import UnlockedFlag from './lock/UnlockFlag'
import { lockRoute } from '../utils/routes'
import useListenForPostMessage from '../hooks/browser/useListenForPostMessage'
import usePostMessage from '../hooks/browser/usePostMessage'
import {
  POST_MESSAGE_LOCKED,
  POST_MESSAGE_UNLOCKED,
} from '../paywall-builder/constants'
import { isPositiveNumber } from '../utils/validators'
import useWindow from '../hooks/browser/useWindow'
import useOptimism from '../hooks/useOptimism'
import withConfig from '../utils/withConfig'
import './Paywall.css'
import keyStatus from '../selectors/keys'
import OptimisticOverlay from './lock/OptimisticOverlay'
import { expirationAsDate } from '../utils/durations'

export function Paywall({
  locks,
  locked,
  redirect,
  config: { requiredConfirmations },
  account,
  transaction,
  keyStatus,
  lockKey,
  expiration,
}) {
  const optimism = useOptimism(transaction)
  const window = useWindow()
  const scrollPosition = useListenForPostMessage({
    type: 'scrollPosition',
    defaultValue: 0,
    validator: isPositiveNumber,
  })
  const { postMessage } = usePostMessage()
  const smallBody = body => {
    body.className = 'small'
  }
  const bigBody = body => {
    body.className = 'big'
  }
  useEffect(() => {
    if (locked) {
      postMessage(POST_MESSAGE_LOCKED)
    } else {
      postMessage(POST_MESSAGE_UNLOCKED)
      if (redirect) {
        const withAccount = account ? '#' + account : ''
        window.location.href = redirect + withAccount
      }
      smallBody(window.document.body)
    }
  }, [locked])
  useEffect(() => {
    if (!locked || !transaction) return
    if (transaction.status === 'pending' && redirect) {
      window.location.href = redirect + '#' + transaction.hash
    }
  }, [transaction, locked, redirect])

  return (
    <GlobalErrorProvider>
      <ShowWhenLocked locked={locked}>
        <OptimisticOverlay
          locks={locks}
          optimism={optimism}
          requiredConfirmations={requiredConfirmations}
          keyStatus={keyStatus}
          transaction={transaction}
        />
        <Overlay
          scrollPosition={scrollPosition}
          locks={locks}
          redirect={redirect}
          optimism={optimism}
          smallBody={() => smallBody(window.document.body)}
          bigBody={() => bigBody(window.document.body)}
          keyStatus={keyStatus}
          lockKey={lockKey}
          transaction={transaction}
        />
        {optimism.current ? null : <DeveloperOverlay />}
      </ShowWhenLocked>
      <ShowWhenUnlocked locked={locked}>
        <UnlockedFlag expiration={expiration} />
      </ShowWhenUnlocked>
    </GlobalErrorProvider>
  )
}

Paywall.propTypes = {
  locks: PropTypes.arrayOf(UnlockPropTypes.lock).isRequired,
  locked: PropTypes.bool.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
  redirect: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  transaction: UnlockPropTypes.transaction,
  account: PropTypes.string,
  keyStatus: PropTypes.string.isRequired,
  lockKey: UnlockPropTypes.key.isRequired,
  expiration: PropTypes.string.isRequired,
}

Paywall.defaultProps = {
  redirect: false,
  account: null,
  transaction: null,
}

export const mapStateToProps = (
  { locks, keys, modals, router, account },
  { config: { requiredConfirmations } }
) => {
  const { lockAddress, redirect } = lockRoute(router.location.pathname)
  const accountAddress = account && account.address
  let transaction = null

  const lock = Object.values(locks).find(
    thisLock => thisLock.address === lockAddress
  )

  let lockKey = Object.values(keys).find(
    key => key.lock === lockAddress && key.owner === accountAddress
  )

  if (lockKey) {
    const keyTransactions = lockKey.transactions
      ? Object.values(lockKey.transactions)
      : []
    if (keyTransactions.length) {
      keyTransactions.sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1))
      transaction = keyTransactions[0]
    }
  } else {
    lockKey = {
      id: `${lockAddress}-${accountAddress}`,
      lock: lockAddress,
      owner: accountAddress,
      expired: 0,
      data: null,
    }
  }

  const currentKeyStatus = keyStatus(lockKey.id, keys, requiredConfirmations)

  const locked =
    !lockKey ||
    !!modals[[lock || { address: '' }].map(l => l.address).join('-')] ||
    currentKeyStatus !== 'valid'
  const expiration = !lockKey ? '' : expirationAsDate(lockKey.expiration)

  return {
    locked,
    locks: lock ? [lock] : [],
    redirect,
    transaction,
    account: accountAddress,
    keyStatus: currentKeyStatus,
    lockKey,
    expiration,
  }
}

export default withConfig(connect(mapStateToProps)(Paywall))
