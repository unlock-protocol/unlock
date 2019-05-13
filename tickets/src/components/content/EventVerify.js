import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import UnlockPropTypes from '../../propTypes'
import { loadEvent } from '../../actions/event'
import Media from '../../theme/media'
import ValidationIcon from './validate/ValidationIcon'

export const EventVerify = ({ lock, event, publicKey, signature }) => {
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
      </BrowserOnly>
    </GlobalErrorConsumer>
  )
}

EventVerify.propTypes = {
  lock: UnlockPropTypes.lock,
  event: UnlockPropTypes.ticketedEvent,
  publicKey: UnlockPropTypes.address,
  signature: PropTypes.string,
}

EventVerify.defaultProps = {
  lock: {},
  event: {},
  publicKey: null,
  signature: null,
}

export const mapDispatchToProps = dispatch => ({
  loadEvent: address => {
    dispatch(loadEvent(address))
  },
})

export const mapStateToProps = ({ router, locks, account, event }) => {
  console.log('Path name')
  console.log(router.location.pathname)
  const [, lockAddress, publicKey, signature] = router.location.pathname.split(
    '/'
  )

  const lock = Object.values(locks).find(
    thisLock => thisLock.address === lockAddress
  )

  return {
    lock,
    event,
    publicKey,
    signature,
    account,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventVerify)

const EventTitle = styled.h2`
  font-family: 'IBM Plex Sans', sans serif;
  font-weight: bold;
  font-size: 16px;
  line-height: 21px;
  ${Media.nophone`
    padding-left: 20px;
  `}
`
