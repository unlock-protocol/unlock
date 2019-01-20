import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../propTypes'
import Overlay from '../components/lock/Overlay'
import DeveloperOverlay from '../components/developer/DeveloperOverlay'
import ShowWhenLocked from '../components/lock/ShowWhenLocked'
import ShowWhenUnlocked from '../components/lock/ShowWhenUnlocked'
import { LOCK_PATH_NAME_REGEXP } from '../constants'
import BrowserOnly from '../components/helpers/BrowserOnly'
import GlobalErrorProvider from '../utils/GlobalErrorProvider'

export function Paywall({ keys, modalShown, locks }) {
  return (
    <BrowserOnly>
      <GlobalErrorProvider>
        <ShowWhenLocked locked={keys.length && !modalShown}>
          <Overlay locks={locks} />
          <DeveloperOverlay />
        </ShowWhenLocked>
        <ShowWhenUnlocked locked={keys.length && !modalShown}>
          <DeveloperOverlay />
        </ShowWhenUnlocked>
      </GlobalErrorProvider>
    </BrowserOnly>
  )
}

Paywall.propTypes = {
  keys: PropTypes.arrayOf(UnlockPropTypes.key),
  modalShown: PropTypes.bool,
  locks: PropTypes.arrayOf(PropTypes.string).isRequired,
}

Paywall.defaultProps = {
  keys: [],
  modalShown: false,
}

export const mapStateToProps = ({ locks, keys, modals, router }) => {
  const match = router.location.pathname.match(LOCK_PATH_NAME_REGEXP)

  const lockFromUri = match
    ? Object.values(locks).find(lock => lock.address === match[1])
    : null

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
  return {
    modalShown: !!modals[locksFromUri.map(l => l.address).join('-')],
    keys: validKeys,
    locks: locksFromUri,
  }
}

export default connect(mapStateToProps)(Paywall)
