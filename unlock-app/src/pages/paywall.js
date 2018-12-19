import React from 'react'
import { connect } from 'react-redux'
import NoSSR from 'react-no-ssr'
import UnlockPropTypes from '../propTypes'
import Overlay from '../components/lock/Overlay'
import ShowUnlessUserHasKeyToAnyLock from '../components/lock/ShowUnlessUserHasKeyToAnyLock'
import { LOCK_PATH_NAME_REGEXP } from '../constants'

const Paywall = ({ lock }) => {
  return (
    <NoSSR>
      <ShowUnlessUserHasKeyToAnyLock locks={lock ? [lock] : []}>
        <Overlay locks={lock ? [lock] : []} />
      </ShowUnlessUserHasKeyToAnyLock>
    </NoSSR>
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
