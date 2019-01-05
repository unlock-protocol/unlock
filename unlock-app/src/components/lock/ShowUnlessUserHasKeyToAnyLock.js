import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import SuspendedRender from '../helpers/SuspendedRender'
import UnlockPropTypes from '../../propTypes'
import { lockPage, unlockPage } from '../../services/iframeService'

export class ShowUnlessUserHasKeyToAnyLock extends Component {
  componentDidMount() {
    this.handleIframeService()
  }
  componentDidUpdate() {
    this.handleIframeService()
  }

  handleIframeService() {
    const { keys } = this.props
    if (keys.length > 0) {
      unlockPage()
    } else {
      lockPage()
    }
  }

  render() {
    const { keys, modalShown, children } = this.props

    // We have at least one valid key and the modal was not shown
    if (keys.length > 0 && !modalShown) {
      return null
    }

    // There is no valid key or we shown the modal previously
    return <SuspendedRender>{children}</SuspendedRender>
  }
}

ShowUnlessUserHasKeyToAnyLock.propTypes = {
  keys: PropTypes.arrayOf(UnlockPropTypes.key),
  modalShown: PropTypes.bool,
  children: PropTypes.node,
}

ShowUnlessUserHasKeyToAnyLock.defaultProps = {
  keys: [],
  children: null,
  modalShown: false,
}

export const mapStateToProps = ({ keys, modals }, { locks }) => {
  let validKeys = []
  locks.forEach(lock => {
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
    modalShown: !!modals[locks.map(l => l.address).join('-')],
    keys: validKeys,
  }
}

export default connect(mapStateToProps)(ShowUnlessUserHasKeyToAnyLock)
