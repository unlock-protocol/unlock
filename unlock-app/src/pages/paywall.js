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
import { lockPage, unlockPage } from '../services/iframeService'

class Paywall extends React.Component {
  constructor(props) {
    super(props)
    this.isLocked = this.isLocked.bind(this)
    this.handleIframe = this.handleIframe.bind(this)
  }
  componentDidMount() {
    this.handleIframe()
  }
  componentDidUpdate() {
    this.handleIframe()
  }
  isLocked() {
    const { keys, modalShown } = this.props
    return keys.length === 0 || modalShown
  }
  handleIframe() {
    if (this.isLocked()) {
      lockPage()
    } else {
      unlockPage()
    }
  }
  render() {
    const { locks } = this.props
    const locked = this.isLocked()
    return (
      <BrowserOnly>
        <GlobalErrorProvider>
          <ShowWhenLocked locked={locked}>
            <Overlay locks={locks} />
            <DeveloperOverlay />
          </ShowWhenLocked>
          <ShowWhenUnlocked locked={locked}>
            <DeveloperOverlay />
          </ShowWhenUnlocked>
        </GlobalErrorProvider>
      </BrowserOnly>
    )
  }
}

Paywall.propTypes = {
  locks: PropTypes.arrayOf(UnlockPropTypes.lock).isRequired,
  keys: PropTypes.arrayOf(UnlockPropTypes.key),
  modalShown: PropTypes.bool,
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
