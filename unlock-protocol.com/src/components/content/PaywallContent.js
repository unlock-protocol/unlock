import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { connect } from 'react-redux'
import UnlockPropTypes from '../../propTypes'
import Overlay from '../lock/Overlay'
import DeveloperOverlay from '../developer/DeveloperOverlay'
import ShowWhenLocked from '../lock/ShowWhenLocked'
import ShowWhenUnlocked from '../lock/ShowWhenUnlocked'
import BrowserOnly from '../helpers/BrowserOnly'
import { lockPage, unlockPage } from '../../services/iframeService'
import { UnlockedFlag } from '../lock/UnlockFlag'
import { lockRoute } from '../../utils/routes'
import { pageTitle } from '../../constants'

class PaywallContent extends React.Component {
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
    const { locks, locked, redirect } = this.props
    return (
      <Fragment>
        <Head>
          <title>{pageTitle('Paywall Demo')}</title>
        </Head>
        <BrowserOnly>
          <ShowWhenLocked locked={locked}>
            <Overlay
              scrollPosition={scrollPosition}
              locks={locks}
              redirect={redirect}
            />
            <DeveloperOverlay />
          </ShowWhenLocked>
          <ShowWhenUnlocked locked={locked}>
            <UnlockedFlag />
          </ShowWhenUnlocked>
        </BrowserOnly>
      </Fragment>
    )
  }
}

PaywallContent.propTypes = {
  locks: PropTypes.arrayOf(UnlockPropTypes.lock).isRequired,
  locked: PropTypes.bool.isRequired,
  redirect: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
}

PaywallContent.defaultProps = {
  redirect: false,
}

export const mapStateToProps = ({ locks, keys, modals, router }) => {
  const { lockAddress, redirect } = lockRoute(router.location.pathname)

  const lockFromUri = Object.values(locks).find(
    lock => lock.address === lockAddress
  )

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
  return { locked, locks: locksFromUri, redirect }
}

export default connect(mapStateToProps)(PaywallContent)
