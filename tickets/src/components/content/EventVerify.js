import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import withConfig from '../../utils/withConfig'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import UnlockPropTypes from '../../propTypes'
import { loadEvent } from '../../actions/event'
import Media from '../../theme/media'
import ValidationIcon from './validate/ValidationIcon'
import DeveloperOverlay from '../developer/DeveloperOverlay'
import { rsvpRoute } from '../../utils/routes'

export const EventVerify = ({
  lock,
  event,
  publicKey,
  signature,
  loadEvent,
  lockAddress,
  config,
}) => {
  if (lock.address && !event) loadEvent(lock.address)

  if (lockAddress && !publicKey && !signature) {
    // This is the route provided by early EthWaterloo QR codes.
    return (
      <GlobalErrorConsumer>
        <BrowserOnly>
          <Layout forContent>
            <Head>
              <title>{pageTitle('Verification')}</title>
            </Head>
            <h1>This QR code cannot be verified.</h1>
            <p>
              Please ask the ticket holder to go to their{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`${config.unlockAppUrl}/keychain`}
              >
                Unlock Keychain
              </a>{' '}
              to generate a fresh QR code.
            </p>
            <p>
              Alternately, direct them to the secondary verification agent so we
              can check them in!
            </p>
          </Layout>
        </BrowserOnly>
      </GlobalErrorConsumer>
    )
  }

  if (!lock.address || !event.name) return null // Wait for the lock and event to load
  const { name } = event

  return (
    <GlobalErrorConsumer>
      <BrowserOnly>
        <Layout forContent>
          <Head>
            <title>{pageTitle(name)}</title>
          </Head>
          <ValidationIcon
            publicKey={publicKey}
            eventAddress={lock.address}
            signature={signature}
          />
          <EventTitle>{name}</EventTitle>
        </Layout>
        <DeveloperOverlay />
      </BrowserOnly>
    </GlobalErrorConsumer>
  )
}

EventVerify.propTypes = {
  lock: UnlockPropTypes.lock,
  event: UnlockPropTypes.ticketedEvent,
  publicKey: UnlockPropTypes.address,
  config: UnlockPropTypes.configuration.isRequired,
  signature: PropTypes.string,
  loadEvent: PropTypes.func.isRequired,
  lockAddress: PropTypes.string,
}

EventVerify.defaultProps = {
  lock: {},
  event: {},
  publicKey: null,
  signature: null,
  lockAddress: null,
}

export const mapDispatchToProps = dispatch => ({
  loadEvent: address => {
    dispatch(loadEvent(address))
  },
})

export const mapStateToProps = ({ router, locks, account, event }) => {
  let { lockAddress, publicKey, signature } = rsvpRoute(
    router.location.pathname
  )

  if (signature) {
    const sigBuffer = Buffer.from(signature, 'base64')
    signature = sigBuffer.toString('utf8') // Unlock.js encodes in base64 unnecessarily. Decoding for now
    // TODO: remove base64 encoding from the signing method in unlock.js so we don't need this anymore
  }

  const lock = Object.values(locks).find(
    thisLock => thisLock.address === lockAddress
  )

  return {
    lock,
    event,
    lockAddress,
    publicKey,
    signature,
    account,
  }
}

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(EventVerify)
)

const EventTitle = styled.h2`
  font-family: 'IBM Plex Sans', sans serif;
  font-weight: bold;
  font-size: 16px;
  line-height: 21px;
  ${Media.nophone`
    padding-left: 20px;
  `}
`
