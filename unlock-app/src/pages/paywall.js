import React from 'react'
import { connect } from 'react-redux'
import UnlockPropTypes from '../propTypes'
import Overlay from '../components/lock/Overlay'
import DeveloperOverlay from '../components/developer/DeveloperOverlay'
import ShowUnlessUserHasKeyToAnyLock from '../components/lock/ShowUnlessUserHasKeyToAnyLock'
import { LOCK_PATH_NAME_REGEXP } from '../constants'
import BrowserOnly from '../components/helpers/BrowserOnly'
import GlobalErrorProvider from '../utils/GlobalErrorProvider'

const Paywall = ({ lock }) => {
  return (
    <BrowserOnly>
      <GlobalErrorProvider>
        <ShowUnlessUserHasKeyToAnyLock locks={lock ? [lock] : []}>
          <Overlay locks={lock ? [lock] : []} />
          <DeveloperOverlay />
        </ShowUnlessUserHasKeyToAnyLock>
      </GlobalErrorProvider>
    </BrowserOnly>
  )
}

Paywall.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
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
