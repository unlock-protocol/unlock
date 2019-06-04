import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import { googleCalendarLinkBuilder } from '../../utils/links.ts'
import { Label } from './CreateContent'
import { MONTH_NAMES, pageTitle, TRANSACTION_TYPES } from '../../constants'
import UnlockPropTypes from '../../propTypes'
import BalanceProvider from '../helpers/BalanceProvider'
import { lockRoute } from '../../utils/routes'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import { purchaseKey } from '../../actions/key'
import { loadEvent } from '../../actions/event'
import PayButton from './purchase/PayButton'
import Media, { NoPhone } from '../../theme/media'
import { transactionTypeMapping } from '../../utils/types'
import keyStatus from '../../selectors/keys'
import withConfig from '../../utils/withConfig'
import DeveloperOverlay from '../developer/DeveloperOverlay'
import Ticket from './purchase/Ticket'
import { getTimeString } from '../../utils/dates'

export const EventContent = ({
  lock,
  lockKey,
  purchaseKey,
  transaction,
  event,
  keyStatus,
  account,
}) => {
  if (!lock.address || !event.name) return null // Wait for the lock and event to load

  const {
    name,
    description,
    location,
    date,
    duration,
    links = [],
    image,
  } = event
  let dateString =
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

  const externalLinks = links.map(({ href, title }) => {
    return (
      <li key={href}>
        <a target="_blank" rel="noopener noreferrer" href={href}>
          {title}
        </a>
      </li>
    )
  })

  const details = `For details, click here ${window.location.href}`

  let googleCalendarLink = googleCalendarLinkBuilder(
    name,
    details,
    date,
    duration,
    location
  )

  return (
    <GlobalErrorConsumer>
      <BrowserOnly>
        <Layout forContent>
          <Head>
            <title>{pageTitle(name)}</title>
          </Head>
          <Header>{image && <Image src={image} />}</Header>
          <Title>{name}</Title>
          <DisplayDate>
            {dateString}
            <DisplayTime>{timeString}</DisplayTime>
          </DisplayDate>
          <Columns count={2}>
            <Column>
              <Description>
                {description.split('\n\n').map(line => {
                  return <DescriptionPara key={line}>{line}</DescriptionPara>
                })}
              </Description>
              <Location>{location}</Location>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={googleCalendarLink}
              >
                Add to your Calendar!
              </a>
              <Links>{externalLinks}</Links>
            </Column>
            <Column>
              <NoPhone>
                <Label>Tickets</Label>
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
              <PayButton
                transaction={transaction}
                keyStatus={keyStatus}
                purchaseKey={() => purchaseKey(lockKey)}
              />
              {['confirming', 'confirmed'].indexOf(keyStatus) > -1 && (
                <small>
                  The transaction may take a couple minutes to go through... You
                  can close this page safely and come back later to see your
                  ticket!
                </small>
              )}
              {account && (
                <Ticket account={account} lock={lock} keyStatus={keyStatus} />
              )}
            </Column>
          </Columns>
        </Layout>
        <DeveloperOverlay />
      </BrowserOnly>
    </GlobalErrorConsumer>
  )
}

EventContent.propTypes = {
  lock: UnlockPropTypes.lock,
  transaction: UnlockPropTypes.transaction,
  purchaseKey: PropTypes.func.isRequired,
  lockKey: UnlockPropTypes.key,
  event: UnlockPropTypes.ticketedEvent,
  keyStatus: PropTypes.string,
  account: UnlockPropTypes.account,
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
  loadEvent: address => {
    dispatch(loadEvent(address))
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

  if (event) {
    event.date = new Date(event.date)
    // TEMPORARY: HARD CODE VALUES FOR NFT EVENT
    if (lockAddress === '0x5865Ff2CBd045Ef1cfE19739df19E83B32b783b4') {
      event.name = 'NFT Dev Meetup - NYC Blockchain Week 2019'
      event.date = new Date(Date.UTC(2019, 4, 16, 22, 30, 0))
      event.duration = 60 * 60 * 3
      event.location = 'Bushwick Generator, 215 Moore St, Brooklyn'
      event.description = `HEYOOOO!

We’re doing something different! By now you’ve probably been to a few too many after-parties. Let's not even talk about Consensus - did you see how packed the hallways were?

Instead, we’re going to have an informal gameshow party where we pit eight blockchain fanatics against each other to debate fiery topics from within the industry. All in good fun and all for laughs!

Meet us at 6:30PM on May 16th, at the Bushwick Generator.

        If you need any help (or Eth) to purchase your ticket, please get in touch with us via the Telegram group below.`
      event.image =
        'https://s3.amazonaws.com/assets.unlock-protocol.com/NFTEventLogos.png'
      event.links = [
        {
          title: '💬 Telegram Group',
          href: 'https://t.me/joinchat/GzMTuRZfLMHZ1n2EMmF0UQ',
        },
        // {
        //   title: 'ℹ️ Eventtrite Page',
        //   href:
        //     'https://www.eventbrite.com/e/nft-dev-meetup-x-dapper-labs-opensea-quantstamp-superrare-unlock-tickets-61273128577',
        // },
      ]
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

const Columns = styled.section`
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

const Links = styled.ul`
  padding: 0px;

  li {
    display: inline-block;
  }
  li + li:before {
    content: ' - ';
    padding: 0 5px;
  }
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

const Description = styled.div`
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
  margin-top: 30px;
`

const DescriptionPara = styled.p`
  margin-bottom: 1em;
`
