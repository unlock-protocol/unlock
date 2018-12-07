import React from 'react'
import { connect } from 'react-redux'
import NoSSR from 'react-no-ssr'
import PropTypes from 'prop-types'
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
    const { lockAddress, locks } = this.props
    const locksForPaywall = Object.keys(locks).reduce((acc, lockId) => {
      if (locks[lockId].address === lockAddress) {
        return {
          ...acc,
          [lockId]: locks[lockId],
        }
      }
      return acc
    }, {})

    return (
      <>
        <NoSSR>
          <ShowUnlessUserHasKeyToAnyLock locks={locksForPaywall}>
            <Overlay locks={locksForPaywall} />
          </ShowUnlessUserHasKeyToAnyLock>
        </NoSSR>
      </>
    )
  }
}

Paywall.propTypes = {
  lockAddress: UnlockPropTypes.address.isRequired,
  locks: UnlockPropTypes.locks.isRequired,
}

const mapStateToProps = state => {
  return {
    locks: state.locks,
  }
}

export default connect(mapStateToProps)(Paywall)
