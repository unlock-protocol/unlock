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
import { lockRoute } from '../../utils/routes'
import Media from '../../theme/media'
import ValidationIcon from './validate/ValidationIcon'

export const EventVerify = ({ lock, event, valid }) => {
  if (!lock.address || !event.name) return null // Wait for the lock and event to load
  const { name } = event

  return (
    <GlobalErrorConsumer>
      <BrowserOnly>
        <Layout forContent>
          <Head>
            <title>{pageTitle(name)}</title>
          </Head>
          <ValidationIcon valid={valid} />
          <EventTitle>{name}</EventTitle>
        </Layout>
      </BrowserOnly>
    </GlobalErrorConsumer>
  )
}

EventVerify.propTypes = {
  lock: UnlockPropTypes.lock,
  event: UnlockPropTypes.ticketedEvent,
  valid: PropTypes.bool,
}

EventVerify.defaultProps = {
  lock: {},
  event: {},
  valid: null,
}

export const mapDispatchToProps = dispatch => ({
  loadEvent: address => {
    dispatch(loadEvent(address))
  },
})

export const mapStateToProps = ({ router, locks, account, event }) => {
  const { lockAddress } = lockRoute(router.location.pathname)

  const lock = Object.values(locks).find(
    thisLock => thisLock.address === lockAddress
  )

  return {
    lock,
    event,
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
