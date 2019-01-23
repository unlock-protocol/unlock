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

export const mapStateToProps = ({ locks, router }) => {
  const match = router.location.pathname.match(LOCK_PATH_NAME_REGEXP)

  const lock = match
    ? Object.values(locks).find(lock => lock.address === match[1])
    : null

  return {
    lock,
  }
}

export default connect(mapStateToProps)(Paywall)
