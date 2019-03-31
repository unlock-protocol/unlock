import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import UnlockPropTypes from '../propTypes'
import Overlay from './lock/Overlay'
import DeveloperOverlay from './developer/DeveloperOverlay'
import ShowWhenLocked from './lock/ShowWhenLocked'
import ShowWhenUnlocked from './lock/ShowWhenUnlocked'
import GlobalErrorProvider from '../utils/GlobalErrorProvider'
import { UnlockedFlag } from './lock/UnlockFlag'
import { lockRoute } from '../utils/routes'
import useListenForPostMessage from '../hooks/browser/useListenForPostMessage'
import usePostMessage from '../hooks/browser/usePostMessage'
import {
  POST_MESSAGE_LOCKED,
  POST_MESSAGE_UNLOCKED,
} from '../paywall-builder/constants'
import { isPositiveNumber } from '../utils/validators'
import useWindow from '../hooks/browser/useWindow'

// TODO: mobile formatting for unlocked and optimistic unlocking views
export function Paywall({ locks, locked, redirect, account }) {
  // TODO: use the useOptimism hook here instead of hard-coding it
  const optimism = { current: 1, past: 0 }
  const window = useWindow()
  const scrollPosition = useListenForPostMessage({
    type: 'scrollPosition',
    defaultValue: 0,
    validator: isPositiveNumber,
  })
  const { postMessage } = usePostMessage()
  const height = '160px'
  const smallBody = body => {
    body.style.margin = '0'
    body.style.height = height
    body.style.display = 'flex'
    body.style.flexDirection = 'column'
    body.style.justifyContent = 'center'
    body.style.overflow = 'hidden'
  }
  const bigBody = body => {
    body.style.margin = '0'
    body.style.height = '100vh'
    body.style.width = '100vw'
    body.style.display = 'fixed'
    body.style.overflow = 'initial'
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

  return (
    <GlobalErrorProvider>
      <ShowWhenLocked locked={locked}>
        <Overlay
          scrollPosition={scrollPosition}
          locks={locks}
          redirect={redirect}
          optimism={optimism}
          smallBody={() => smallBody(window.document.body)}
          bigBody={() => bigBody(window.document.body)}
        />
        {optimism.current ? null : <DeveloperOverlay />}
      </ShowWhenLocked>
      <ShowWhenUnlocked locked={locked}>
        <UnlockedFlag />
      </ShowWhenUnlocked>
    </GlobalErrorProvider>
  )
}

Paywall.propTypes = {
  locks: PropTypes.arrayOf(UnlockPropTypes.lock).isRequired,
  locked: PropTypes.bool.isRequired,
  redirect: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  account: PropTypes.string,
}

Paywall.defaultProps = {
  redirect: false,
  account: null,
}

export const mapStateToProps = ({ locks, keys, modals, router, account }) => {
  const { lockAddress, redirect } = lockRoute(router.location.pathname)

  const lockFromUri = Object.values(locks).find(
    lock => lock.address === lockAddress
  )

  let validKeys = []
  const locksFromUri = lockFromUri ? [lockFromUri] : []
  locksFromUri.forEach(lock => {
    for (let k of Object.values(keys)) {
      if (
        k.lock === lock.address &&
        k.expiration > new Date().getTime() / 1000
      ) {
        validKeys.push(k)
      }
    }
  })

  const modalShown = !!modals[locksFromUri.map(l => l.address).join('-')]
  const locked = validKeys.length === 0 || modalShown
  return {
    locked,
    locks: locksFromUri,
    redirect,
    account: account && account.address,
  }
}

export default connect(mapStateToProps)(Paywall)
