import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import { googleCalendarLinkBuilder } from '../../utils/links.ts'
import { Field, Label } from './CreateContent'
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

  const { name, description, location, date, links = [], image } = event
  let dateString =
    MONTH_NAMES[date.getMonth()] +
    ' ' +
    date.getDate() +
    ', ' +
    date.getFullYear()

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
    location
  )

  return (
    <GlobalErrorConsumer>
      <BrowserOnly>
        <Layout forContent>
          <Head>
            <title>{pageTitle(name)}</title>
          </Head>
          <Title>{name}</Title>
          <Header>{image && <Image src={image} />}</Header>

          <Row>
            <div>
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
            </div>
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
          </Row>
          <Row>
            <DetailsField>
              <DisplayDate>{dateString}</DisplayDate>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={googleCalendarLink}
              >
                Add to your Calendar!
              </a>

              <Description>
                {description.split('\n\n').map(line => {
                  return <p key={line}>{line}</p>
                })}
              </Description>
              <Location>{location}</Location>
              <Links>{externalLinks}</Links>
            </DetailsField>
            <DetailsField>
              {account && (
                <Ticket account={account} lock={lock} keyStatus={keyStatus} />
              )}
            </DetailsField>
          </Row>
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

      event.location = 'Bushwick Generator, 215 Moore St, Brooklyn'
      event.description = `HEYOOOO!

We’re doing something different! By now you’ve probably been to a few too many after parties. Let's not even talk about Consensus, did you see how packed the hallways get? Geez Louise!

Instead, we’re going to have an informal gameshow party where we pit eight blockchain fanatics against each other to debate fiery topics from within the industry. All in good fun and all for laughs!

Meet us at 630PM on May 16th, at the Bushwick Generator


        If you need any help (or Eth) to purchase your ticket, please get in touch with us on the Telegram group below.`
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

const Row = styled.section`
  padding: 0px 20px;
  border: none;

  ${Media.nophone`
    display: grid;
    grid-gap: 30px;
    grid-template-columns: repeat(2, minmax(250px, 1fr));
    align-items: top;
  `}
`

const Header = styled.section`
  padding: 0px 20px;
  border: none;
  max-width: 800px;

  ${Media.nophone`
    display: grid;
    grid-gap: 30px;
    align-items: top;
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
  grid-template-columns: 200px 1fr;
  grid-gap: 10px;
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

const DetailsField = styled.div``

const DisplayDate = styled.h2`
  font-family: 'IBM Plex Sans', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  color: var(--red);
  margin-bottom: 2px;
`

const Description = styled.div`
  font-size: 20px;
  font-family: 'IBM Plex Serif', serif;
`

const Location = styled.p`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px;
  margin-top: 30px;
`
