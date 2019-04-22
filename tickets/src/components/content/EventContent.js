import React, { Component } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'

import { Fieldset, Field, Label } from './CreateContent'
import { MONTH_NAMES, pageTitle, TRANSACTION_TYPES } from '../../constants'
import UnlockPropTypes from '../../propTypes'
import BalanceProvider from '../helpers/BalanceProvider'
import { lockRoute } from '../../utils/routes'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import { purchaseKey } from '../../actions/key'
import { loadEvent } from '../../actions/ticket'
import PayButton from './purchase/PayButton'

export class EventContent extends Component {
  constructor(props) {
    super(props)

    let { event } = this.props
    if (!event) event = {}

    this.state = {
      event: event,
    }
  }

  componentDidUpdate() {
    const { lock, loadEvent } = this.props
    const { event } = this.state
    if (lock.address && !event.lockAddress) loadEvent(lock.address)
  }

  render() {
    const { lock, lockKey, purchaseKey, transaction } = this.props
    const { event } = this.state

    if (!lock.address || !event.name) return null // Wait for the lock and event to load

    const { name, description, location, date } = event
    let dateString =
      MONTH_NAMES[date.getMonth()] +
      ' ' +
      date.getDate() +
      ', ' +
      date.getFullYear()

    return (
      <GlobalErrorConsumer>
        <BrowserOnly>
          <Layout forContent>
            <Head>
              <title>{pageTitle(name)}</title>
            </Head>
            <Title>{name}</Title>
            <DetailsFieldset>
              <Field>
                <Label>Ticket Price</Label>
                <BalanceProvider
                  amount={lock.keyPrice}
                  render={(ethWithPresentation, convertedUSDValue) => (
                    <Price>
                      <Eth>{ethWithPresentation} ETH</Eth>
                      <Fiat>${convertedUSDValue}</Fiat>
                    </Price>
                  )}
                />
              </Field>
              <PayButton
                transaction={transaction}
                purchaseKey={() => purchaseKey(lockKey)}
              />
            </DetailsFieldset>
            <DetailsFieldset>
              <DetailsField>
                <DisplayDate>{dateString}</DisplayDate>
                <Description>{description}</Description>
              </DetailsField>
              <Field>
                <Label>Location</Label>
                <Description>{location}</Description>
              </Field>
            </DetailsFieldset>
          </Layout>
        </BrowserOnly>
      </GlobalErrorConsumer>
    )
  }
}

EventContent.propTypes = {
  lock: UnlockPropTypes.lock,
  transaction: UnlockPropTypes.transaction,
  purchaseKey: PropTypes.func.isRequired,
  loadEvent: PropTypes.func.isRequired,
  lockKey: UnlockPropTypes.key,
  event: UnlockPropTypes.ticketedEvent,
  // Properties to add once we're showing the QR code:
  //locked: PropTypes.bool.isRequired,
}

EventContent.defaultProps = {
  lock: {},
  transaction: null,
  lockKey: null,
  event: {},
}

export const mapDispatchToProps = dispatch => ({
  purchaseKey: key => {
    dispatch(purchaseKey(key))
  },
  loadEvent: address => {
    dispatch(loadEvent(address))
  },
})

export const mapStateToProps = ({
  router,
  locks,
  keys,
  account,
  transactions,
}) => {
  if (!account) {
    return {}
  }

  const { lockAddress } = lockRoute(router.location.pathname)

  const lock = Object.values(locks).find(
    thisLock => thisLock.address === lockAddress
  )

  const accountAddress = account && account.address

  let lockKey = Object.values(keys).find(
    key => key.lock === lockAddress && key.owner === accountAddress
  )

  if (!lockKey) {
    lockKey = {
      id: `${lockAddress}-${accountAddress}`,
      lock: lockAddress,
      owner: accountAddress,
      expired: 0,
      data: null,
    }
  }

  let transaction = null
  transaction = Object.values(transactions).find(
    transaction =>
      transaction.type === TRANSACTION_TYPES.KEY_PURCHASE &&
      transaction.key === lockKey.id
  )

  return {
    lock,
    lockKey,
    transaction,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventContent)

const Title = styled.h1`
  font-family: 'IBM Plex Serif', serif;
  font-style: normal;
  font-weight: normal;
  font-size: 30px;
  line-height: normal;
  color: var(--dimgrey);
  padding-left: 20px;
  padding-right: 20px;
`

const Price = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 10px;
`

const Eth = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: bold;
  font-size: 30px;
  line-height: 39px;
  color: var(--dimgrey);
`

const Fiat = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 20px;
  line-height: 27px;
  text-align: right;
  color: var(--grey);
`

const DetailsFieldset = styled(Fieldset)`
  margin-bottom: 30px;
  padding-left: 20px;
  padding-right: 20px;
`

const DetailsField = styled(Field)`
  grid-template-rows: 35px auto;
`

const DisplayDate = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  color: var(--red);
`

const Description = styled.div`
  font-size: 20px;
  font-family: 'IBM Plex Serif', serif;
`
