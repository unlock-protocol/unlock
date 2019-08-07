import ReactGA from 'react-ga'
import App, { Container } from 'next/app'
import React from 'react'
import Intercom from 'react-intercom'
import getConfig from 'next/config'

import GlobalStyle from '../theme/globalStyle'
import Membership from '../components/interface/Membership'
import { MembershipContext } from '../membershipContext'
import { GA_LABELS, GA_ACTIONS } from '../constants'

const config = getConfig().publicRuntimeConfig

const isServer = typeof window === 'undefined'

class UnlockProtocolSiteApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  constructor(props, context) {
    super(props, context)

    if (!isServer) {
      /* eslint-disable no-console */
      console.info(`
*********************************************************************
Thanks for checking out Unlock!

We're building the missing payments layer for the web: a protocol
which enables creators to monetize their content with a few lines of
code in a fully decentralized way.

We would love your help.

Jobs: https://unlock-protocol.com/jobs

Open source community: https://github.com/unlock-protocol/unlock

Good first issues: https://github.com/unlock-protocol/unlock/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22

Get in touch: hello@unlock-protocol.com

Love,

The Unlock team
*********************************************************************`)
      /* eslint-enable no-console */
    }

    this.state = {
      isMember: 'pending',
      gaInitialized: false,
    }

    // Listen to Unlock events
    if (process.browser) {
      this.state.becomeMember = () => {
        ReactGA.event({
          category: GA_LABELS.MEMBERSHIP,
          action: GA_ACTIONS.MEMBERSHIP_BANNER_CLICKED,
        })
        return (
          window.unlockProtocol && window.unlockProtocol.loadCheckoutModal()
        )
      }

      // Initialize Google Analytics on the client side only, and only once
      if (
        !this.state.gaInitialized &&
        config.googleAnalyticsId &&
        config.googleAnalyticsId !== '0'
      ) {
        ReactGA.initialize(config.googleAnalyticsId)
        this.setState(state => ({
          ...state,
          gaInitialized: true,
        }))
      }

      window.addEventListener('unlockProtocol', event => {
        if (!this.state.gaInitialized) return
        if (event.detail === 'unlocked') {
          ReactGA.event({
            category: GA_LABELS.MEMBERSHIP,
            action: GA_ACTIONS.UNLOCKED,
          })
          this.setState(state => ({
            ...state,
            isMember: 'yes',
          }))
        }
        if (event.detail === 'locked') {
          ReactGA.event({
            category: GA_LABELS.MEMBERSHIP,
            action: GA_ACTIONS.LOCKED,
          })
          this.setState(state => ({
            ...state,
            isMember: 'no',
          }))
        }
      })
    }
  }

  render() {
    const { Component, pageProps } = this.props

    return (
      <Container>
        <MembershipContext.Provider value={this.state}>
          <Membership />
          <GlobalStyle />
          <Component {...pageProps} />
          <Intercom appID={config.intercomAppId} />
        </MembershipContext.Provider>
      </Container>
    )
  }
}

export default UnlockProtocolSiteApp
