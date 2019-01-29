import React from 'react'
import { connect } from 'react-redux'
import UnlockPropTypes from '../propTypes'
import Overlay from '../components/lock/Overlay'
import DeveloperOverlay from '../components/developer/DeveloperOverlay'
import ShowUnlessUserHasKeyToAnyLock from '../components/lock/ShowUnlessUserHasKeyToAnyLock'
import { LOCK_PATH_NAME_REGEXP } from '../constants'
import BrowserOnly from '../components/helpers/BrowserOnly'
import GlobalErrorProvider from '../utils/GlobalErrorProvider'

class Paywall extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      scrollPosition: 0,
    }
    this.handleScrollPosition = this.handleScrollPosition.bind(this)
  }
  componentDidMount() {
    window.addEventListener('message', event => {
      if (event.data.scrollPosition) {
        this.handleScrollPosition(event.data.scrollPosition)
      }
    })
  }
  handleScrollPosition(scrollPosition) {
    this.setState({ scrollPosition })
  }
  render() {
    const { lock } = this.props
    const { scrollPosition } = this.state

    return (
      <BrowserOnly>
        <GlobalErrorProvider>
          <ShowUnlessUserHasKeyToAnyLock locks={lock ? [lock] : []}>
            <Overlay
              scrollPosition={scrollPosition}
              locks={lock ? [lock] : []}
            />
            <DeveloperOverlay />
          </ShowUnlessUserHasKeyToAnyLock>
        </GlobalErrorProvider>
      </BrowserOnly>
    )
  }
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
