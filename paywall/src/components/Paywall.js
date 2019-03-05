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
} from '../../paywall-builder/constants'
import { isPositiveInteger } from '../utils/validators'

export function Paywall({ locks, locked, redirect }) {
  const scrollPosition = useListenForPostMessage({
    type: 'scrollPosition',
    defaultValue: 0,
    validator: isPositiveInteger,
  })
  const { postMessage } = usePostMessage()
  useEffect(
    () => {
      if (locked) {
        postMessage(POST_MESSAGE_LOCKED)
      } else {
        postMessage(POST_MESSAGE_UNLOCKED)
      }
    },
    [locked]
  )

  return (
    <GlobalErrorProvider>
      <ShowWhenLocked locked={locked}>
        <Overlay
          scrollPosition={scrollPosition}
          locks={locks}
          redirect={redirect}
        />
        <DeveloperOverlay />
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
}

Paywall.defaultProps = {
  redirect: false,
}

export const mapStateToProps = ({ locks, keys, modals, router }) => {
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
  return { locked, locks: locksFromUri, redirect }
}

export default connect(mapStateToProps)(Paywall)
