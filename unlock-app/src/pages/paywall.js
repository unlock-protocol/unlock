import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import UnlockPropTypes from '../propTypes'
import Overlay from '../components/lock/Overlay'
import DeveloperOverlay from '../components/developer/DeveloperOverlay'
import ShowUnlessUserHasKeyToAnyLock from '../components/lock/ShowUnlessUserHasKeyToAnyLock'
import { LOCK_PATH_NAME_REGEXP } from '../constants'
import BrowserOnly from '../components/helpers/BrowserOnly'
import GlobalErrorProvider from '../utils/GlobalErrorProvider'

const Paywall = ({ lock, redirect }) => {
  return (
    <BrowserOnly>
      <GlobalErrorProvider>
        <ShowUnlessUserHasKeyToAnyLock locks={lock ? [lock] : []}>
          <Overlay locks={lock ? [lock] : []} redirect={redirect} />
          <DeveloperOverlay />
        </ShowUnlessUserHasKeyToAnyLock>
      </GlobalErrorProvider>
    </BrowserOnly>
  )
}

Paywall.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  redirect: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
}

Paywall.defaultProps = {
  redirect: false,
}

export const mapStateToProps = ({ locks, router }) => {
  const match = router.location.pathname.match(LOCK_PATH_NAME_REGEXP)

  if (match) {
    const lock = Object.values(locks).find(lock => lock.address === match[1])
    const redirect = decodeURIComponent(match[3])
    return { lock, redirect }
  }

  return {
    lock: null,
    redirect: false,
  }
}

export default connect(mapStateToProps)(Paywall)
