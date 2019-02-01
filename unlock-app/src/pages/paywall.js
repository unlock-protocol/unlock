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
    this.state = {
      scrollPosition: 0,
    }
    this.handleScrollPosition = this.handleScrollPosition.bind(this)
    this.handleIframe = this.handleIframe.bind(this)
  }
  componentDidMount() {
    window.addEventListener('message', event => {
      if (event.data.scrollPosition) {
        this.handleScrollPosition(event.data.scrollPosition)
      }
    })
    this.handleIframe()
  }
  componentDidUpdate() {
    this.handleIframe()
  }
  handleScrollPosition(scrollPosition) {
    this.setState(state => {
      if (state.scrollPosition === scrollPosition) return null
      return { scrollPosition }
    })
  }
  handleIframe() {
    const { locked } = this.props
    if (locked) {
      lockPage()
    } else {
      unlockPage()
    }
  }
  render() {
    const { scrollPosition } = this.state
    const { locks, locked } = this.props
    return (
      <BrowserOnly>
        <GlobalErrorProvider>
          <ShowWhenLocked locked={locked}>
            <Overlay scrollPosition={scrollPosition} locks={locks} />
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
  locked: PropTypes.bool.isRequired,
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

  const modalShown = !!modals[locksFromUri.map(l => l.address).join('-')]
  const locked = validKeys.length === 0 || modalShown

  return {
    locks: locksFromUri,
    locked,
  }
}

export default connect(mapStateToProps)(Paywall)
