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
import { NoPhone } from '../../theme/media'
import { transactionTypeMapping } from '../../utils/types'
import keyStatus from '../../selectors/keys'
import withConfig from '../../utils/withConfig'

export class EventContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loaded: false,
    }

    this.setAsLoaded.bind(this)
  }

  componentDidUpdate() {
    const { lock, loadEvent, event } = this.props
    const { loaded } = this.state
    if (lock.address && !event.lockAddress && !loaded) {
      loadEvent(lock.address)
      this.setAsLoaded() // To prevent multiple loads
    }
  }

  setAsLoaded() {
    this.setState({ loaded: true })
  }

  render() {
    const {
      lock,
      lockKey,
      purchaseKey,
      transaction,
      event,
      keyStatus,
    } = this.props

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
            <PaymentFieldset>
              <PayButton
                transaction={transaction}
                keyStatus={keyStatus}
                purchaseKey={() => purchaseKey(lockKey)}
              />
              <Field>
                <NoPhone>
                  <Label>Ticket Price</Label>
                </NoPhone>
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
            </PaymentFieldset>
            <DetailsFieldset>
              <DetailsField>
                <DisplayDate>{dateString}</DisplayDate>
                <Description>{description}</Description>
                <Location>{location}</Location>
              </DetailsField>
              <DetailsField>
                <div />
              </DetailsField>
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
  keyStatus: PropTypes.string,
  // Properties to add once we're showing the QR code:
  //locked: PropTypes.bool.isRequired,
}

EventContent.defaultProps = {
  lock: {},
  transaction: null,
  lockKey: null,
  event: {},
  keyStatus: null,
}

export const mapDispatchToProps = dispatch => ({
  purchaseKey: key => {
    dispatch(purchaseKey(key))
  },
  loadEvent: address => {
    dispatch(loadEvent(address))
  },
})

export const mapStateToProps = (
  { router, locks, keys, account, transactions, tickets: { event } },
  { config: { requiredConfirmations } }
) => {
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

  let processedEvent
  if (event) {
    const { name, date, lockAddress, description, location } = event
    processedEvent = {
      name,
      date: new Date(date),
      lockAddress,
      description,
      location,
    }
  }

  let transaction = null
  transaction = Object.values(transactions).find(
    transaction =>
      transaction.type ===
        transactionTypeMapping(TRANSACTION_TYPES.KEY_PURCHASE) &&
      transaction.key === lockKey.id
  )

  const currentKeyStatus = keyStatus(lockKey.id, keys, requiredConfirmations)

  return {
    lock,
    lockKey,
    transaction,
    keyStatus: currentKeyStatus,
    event: processedEvent,
  }
}

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(EventContent)
)

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

const PaymentFieldset = styled(Fieldset)`
  padding-left: 20px;
  padding-right: 20px;
`

const DetailsField = styled(Field)`
  grid-template-rows: 35px auto;
  & > ${Label} {
    align-self: center;
  }
`

const DisplayDate = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  color: var(--red);
`

const Description = styled.div`
  font-size: 20px;
  font-family: 'IBM Plex Serif', serif;
`

const Location = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px;
  line-height: 20px;
  margin-top: 30px;
`
