import React from 'react'
import { connect } from 'react-redux'
import NoSSR from 'react-no-ssr'
import UnlockPropTypes from '../propTypes'
import Overlay from '../components/lock/Overlay'
import ShowUnlessUserHasKeyToAnyLock from '../components/lock/ShowUnlessUserHasKeyToAnyLock'

export class Paywall extends React.Component {
  static async getInitialProps({ query: { lockAddress } }) {
    return {
      lockAddress: lockAddress,
    }
  }

  render() {
    const { lock } = this.props

    return (
      <NoSSR>
        <ShowUnlessUserHasKeyToAnyLock locks={lock ? [lock] : []}>
          <Overlay locks={lock ? [lock] : []} />
        </ShowUnlessUserHasKeyToAnyLock>
      </NoSSR>
    )
  }
}

Paywall.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export const mapStateToProps = ({ locks: stateLocks }, { lockAddress }) => {
  const lock = Object.values(stateLocks).find(
    lock => lock.address === lockAddress
  )

  return {
    lock,
  }
}

export default connect(mapStateToProps)(Paywall)
