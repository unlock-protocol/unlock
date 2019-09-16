import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { googleCalendarLinkBuilder } from '../../utils/links.ts'
import { Label } from '../interface/EventStyles'
import { MONTH_NAMES, pageTitle, TRANSACTION_TYPES } from '../../constants'
import UnlockPropTypes from '../../propTypes'
import BalanceProvider from '../helpers/BalanceProvider'
import { lockRoute } from '../../utils/routes'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import { purchaseKey } from '../../actions/key'
import PayButton from './purchase/PayButton'
import Media, { NoPhone } from '../../theme/media'
import { transactionTypeMapping } from '../../utils/types'
import keyStatus from '../../selectors/keys'
import withConfig from '../../utils/withConfig'
import DeveloperOverlay from '../developer/DeveloperOverlay'
import Ticket from './purchase/Ticket'
import { getTimeString } from '../../utils/dates'
import { currencySymbolForLock } from '../../utils/locks'

function EventDate({ date, duration }) {
  const dateString =
    MONTH_NAMES[date.getMonth()] +
    ' ' +
    date.getDate() +
    ', ' +
    date.getFullYear()

  let timeString = getTimeString(date)
  if (duration) {
    timeString +=
      ' - ' + getTimeString(new Date(date.getTime() + duration * 1000))
  }

  return (
    <DisplayDate>
      {dateString}
      <DisplayTime>{timeString}</DisplayTime>
    </DisplayDate>
  )
}
EventDate.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  duration: PropTypes.number.isRequired,
}

function EventLinks({ event }) {
  const { name, description, links = [], date, duration, location } = event
  // Start building the info for the GCal link
  let details = description

  // Clean up user-provided links
  const sanitizedLinks = links.map(link => {
    link.href = encodeURI(link.href)
    return link
  })

  if (sanitizedLinks.length) {
    details += '\n\n<strong>Event Website</strong>'
    sanitizedLinks.forEach(link => {
      details += '\n' + link.href
    })
  }
  details += `\n\n<strong>Ticket Details</strong>\n${window.location.href}`

  // No need to sanitize the GCal link because googleCalendarLinkBuilder does it for us
  let googleCalendarLink = googleCalendarLinkBuilder(
    name,
    details,
    date,
    duration,
    location
  )

  const eventLinks = [
    ...sanitizedLinks,
    {
      href: googleCalendarLink,
      text: 'Add to your Calendar!',
      icon: '/static/images/illustrations/calendar.svg',
    },
  ]

  const externalLinks = eventLinks.map(
    ({ href, text, icon = '/static/images/illustrations/link.svg' }) => {
      return (
        <Link key={href} icon={icon}>
          <a target="_blank" rel="noopener noreferrer" href={href}>
            {text}
          </a>
        </Link>
      )
    }
  )

  return <Links>{externalLinks}</Links>
}
EventLinks.propTypes = {
  event: UnlockPropTypes.ticketedEvent.isRequired,
}

function Description({ body }) {
  return (
    <DescriptionWrapper>
      {body.split('\n\n').map(line => {
        return <DescriptionPara key={line}>{line}</DescriptionPara>
      })}
    </DescriptionWrapper>
  )
}
Description.propTypes = {
  body: PropTypes.string.isRequired,
}

function LoadingTicket() {
  return (
    <Column>
      <Label>Loading ticket details...</Label>
      <Loading>
        <img alt="loading" src="/static/images/loading.svg" />
      </Loading>
    </Column>
  )
}

function TicketInfo({
  lock,
  config,
  transaction,
  lockKey,
  account,
  keyStatus,
  purchaseKey,
}) {
  let currency = currencySymbolForLock(lock, config)

  const convertCurrency = !lock.currencyContractAddress

  return (
    <Column>
      <NoPhone>
        <Label>Tickets</Label>
      </NoPhone>
      <BalanceProvider
        amount={lock.keyPrice}
        render={(ethWithPresentation, convertedUSDValue) => (
          <Price>
            <Eth>
              {ethWithPresentation} {currency}
            </Eth>
            {convertCurrency && <Fiat>${convertedUSDValue}</Fiat>}
          </Price>
        )}
      />
      <PayButton
        transaction={transaction}
        keyStatus={keyStatus}
        purchaseKey={() => purchaseKey(lockKey)}
      />
      {['confirming', 'confirmed'].indexOf(keyStatus) > -1 && (
        <small>
          The transaction may take a couple minutes to go through... You can
          close this page safely and come back later to see your ticket!
        </small>
      )}
      {account && (
        <Ticket account={account} lock={lock} keyStatus={keyStatus} />
      )}
    </Column>
  )
}
TicketInfo.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
  transaction: UnlockPropTypes.transaction,
  lockKey: UnlockPropTypes.key,
  account: UnlockPropTypes.account.isRequired,
  keyStatus: PropTypes.string.isRequired,
  purchaseKey: PropTypes.func.isRequired,
}
TicketInfo.defaultProps = {
  lockKey: null,
  transaction: null,
}

const paywallLocked = 'locked'
const paywallUnlocked = 'unlocked'

export class EventContent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      paywallStatus: null,
    }

    // Register event listener for Unlock events before the page ever loads
    if (window) {
      window.addEventListener('unlockProtocol', this.setPaywallStatus)
    }
  }

  componentWillUnmount = () => {
    if (window) {
      window.removeEventListener('unlockProtocol', this.setPaywallStatus)
    }
  }

  setPaywallStatus = event => {
    const d = event.detail

    // Making sure we only set state to expected values, since it's possible for
    // someone to manually send a CustomEvent
    if (d === paywallLocked || d === paywallUnlocked) {
      this.setState({
        paywallStatus: d,
      })
    }
  }

  render = () => {
    const { paywallStatus } = this.state
    const {
      event,
      lock,
      keyStatus,
      transaction,
      config,
      lockKey,
      account,
      purchaseKey,
    } = this.props
    const { name, description, location, date, duration, image } = event

    return (
      <BrowserOnly>
        <Layout forContent>
          <Head>
            <title>{pageTitle(name)}</title>
            <script src={paywallScriptUrl(config.env)} />
          </Head>
          <Header>{image && <Image src={image} />}</Header>
          <Title>{name}</Title>
          <EventDate date={date} duration={duration} />
          <Location>{location}</Location>
          <Columns count={2}>
            <Column>
              <Description body={description} />
              <EventLinks event={event} />
            </Column>
            {lock.address && keyStatus && (
              <TicketInfo
                lock={lock}
                config={config}
                transaction={transaction}
                lockKey={lockKey}
                account={account}
                keyStatus={keyStatus}
                purchaseKey={purchaseKey}
              />
            )}
            {(!lock.address || !keyStatus) && <LoadingTicket />}
          </Columns>
          <span>The paywall status is {paywallStatus}</span>
        </Layout>
        <DeveloperOverlay />
      </BrowserOnly>
    )
  }
}

EventContent.propTypes = {
  lock: UnlockPropTypes.lock,
  transaction: UnlockPropTypes.transaction,
  purchaseKey: PropTypes.func.isRequired,
  lockKey: UnlockPropTypes.key,
  event: UnlockPropTypes.ticketedEvent,
  keyStatus: PropTypes.string,
  account: UnlockPropTypes.account,
  config: UnlockPropTypes.configuration.isRequired,
}

EventContent.defaultProps = {
  lock: {},
  transaction: null,
  lockKey: null,
  event: {},
  keyStatus: null,
  account: null,
}

export const mapDispatchToProps = dispatch => ({
  purchaseKey: key => {
    dispatch(purchaseKey(key))
  },
})

export const mapStateToProps = (
  { router, locks, keys, account, transactions, event },
  { config: { requiredConfirmations } }
) => {
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
    event,
    account,
  }
}

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(EventContent)
)

function paywallScriptUrl(env) {
  const extension = '/static/unlock.1.0.min.js'

  // TODO: add test url?
  const baseUrls = {
    dev: 'http://localhost:3001',
    staging: 'https://staging-paywall.unlock-protocol.com',
    prod: 'https://paywall.unlock-protocol.com',
  }

  return baseUrls[env] + extension
}

const Columns = styled.section`
  margin-top: 10px;
  ${Media.nophone`
    display: grid;
    grid-gap: 40px;
    grid-template-columns: repeat(${props => props.count || 2}, 1fr);
    align-items: start;
    padding-left: 20px;
  `}
`

const Column = styled.div`
  display: grid;
  align-items: start;
  grid-gap: 10px;
`

const Header = styled.section`
  padding: 0px 20px;
  border: none;
  max-width: 800px;

  ${Media.nophone`
    display: grid;
    grid-gap: 30px;
    align-items: start;
  `}
`

const Image = styled.img`
  max-width: 100%;
`

const Link = styled.li`
  margin-top: 15px;
  font-weight: 200;
  list-style: none;
  background: url(${props => props.icon}) no-repeat;
  padding-left: 40px;
`

const Links = styled.ul`
  font-size: 24px;
  padding: 0px;
`

export const Title = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: normal;
  margin-bottom: 0px;
  ${Media.nophone`
    padding-left: 20px;
  `}
`

const Price = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
`

const Eth = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: bold;
  font-size: 30px;
  color: var(--dimgrey);
`

const Fiat = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 20px;
  text-align: left;
  color: var(--grey);
`

const DisplayDate = styled.h2`
  font-family: 'IBM Plex Sans', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  color: var(--red);
  margin-top: 0px;
  margin-bottom: 0px;
  ${Media.nophone`
    padding-left: 20px;
  `}
`

const DisplayTime = styled.span`
  border: 0;
  border-left: var(--grey) solid 2px;
  padding-left: 10px;
  margin-left: 10px;
`

const DescriptionWrapper = styled.div`
  font-size: 24px;
  font-family: 'IBM Plex Sans', sans-serif;
  p {
    padding: 0.5em 0;
    margin: 0px;
  }
`

const Location = styled.p`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px;
  margin: 0px;
  padding-left: 20px;
`

const DescriptionPara = styled.p`
  margin-bottom: 1em;
`

const Loading = styled.div`
  display: grid;
  align-items: center;
  img {
    width: 30px;
  }
`
