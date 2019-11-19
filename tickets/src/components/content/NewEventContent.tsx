import React, { Component } from 'react'
import Head from 'next/head'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { lockRoute } from '../../utils/routes'
import Layout from '../interface/Layout'
import withConfig from '../../utils/withConfig'
import { pageTitle } from '../../constants'
import EventInfo from '../interface/EventInfo'
import EventLinks from '../interface/EventLinks'
import EventDescription from '../interface/EventDescription'
import PurchaseTicket from '../interface/PurchaseTicket'
import PurchaseSuccess from '../interface/PurchaseSuccess'
import Media from '../../theme/media'

interface UnlockWindow extends Window {
  unlockProtocol?: any
  unlockProtocolConfig?: any
}

declare var window: UnlockWindow | undefined

enum PaywallStatus {
  Locked = 'locked',
  Unlocked = 'unlocked',
  Unknown = 'unknown',
}

interface EventContentBodyProps {
  config: {
    unlockAppUrl: string
  }
  event: any
  paywallStatus: PaywallStatus
}

export const EventContentBody = ({
  paywallStatus,
  event,
  config,
}: EventContentBodyProps) => {
  return (
    <>
      <EventInfo event={event} />
      <Columns>
        <Column>
          <EventDescription body={event.description || ''} />
          <EventLinks event={event} />
        </Column>
        <Column>
          {paywallStatus === PaywallStatus.Locked && (
            <PurchaseTicket
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.unlockProtocol &&
                    window.unlockProtocol.loadCheckoutModal()
                }
              }}
            />
          )}
          {paywallStatus === PaywallStatus.Unlocked && (
            <PurchaseSuccess unlockAppUrl={config.unlockAppUrl} />
          )}
          {paywallStatus !== PaywallStatus.Unlocked &&
            paywallStatus !== PaywallStatus.Locked && <p>Loading...</p>}
        </Column>
      </Columns>
    </>
  )
}

interface EventContentProps {
  lockAddress: string
  config: {
    env: string
    unlockAppUrl: string
  }
  event: any
}

interface EventContentState {
  paywallStatus: PaywallStatus
}

export class EventContent extends Component<
  EventContentProps,
  EventContentState
> {
  constructor(props: EventContentProps) {
    super(props)

    const { lockAddress } = props

    this.state = {
      paywallStatus: PaywallStatus.Unknown,
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('unlockProtocol', this.setPaywallStatus)

      const url = new URL(window.location.href)
      const unlockUserAccounts =
        url.searchParams.get('unlockUserAccounts') === 'true'

      // TODO: Make this nicer
      window.unlockProtocolConfig = {
        persistentCheckout: false,
        locks: {
          [lockAddress]: {},
        },
        callToAction: {
          default: 'Purchase a ticket using the Unlock Protocol',
        },
        unlockUserAccounts,
      }
    }
  }

  componentWillUnmount = () => {
    if (window) {
      window.removeEventListener('unlockProtocol', this.setPaywallStatus)
    }
  }

  setPaywallStatus = (event: Event) => {
    const d = (event as any).detail

    // Making sure we only set state to expected values, since it's possible for
    // someone to manually send a CustomEvent
    if (d === PaywallStatus.Locked || d === PaywallStatus.Unlocked) {
      this.setState({
        paywallStatus: d,
      })
    }
  }

  paywallScriptUrl = (): string => {
    const {
      config: { env },
    } = this.props
    const extension = '/static/unlock.1.0.min.js'

    // TODO: add test url?
    const baseUrls: { [key: string]: string } = {
      dev: 'http://localhost:3001',
      staging: 'https://staging-paywall.unlock-protocol.com',
      prod: 'https://paywall.unlock-protocol.com',
    }

    return baseUrls[env] + extension
  }

  render() {
    const { paywallStatus } = this.state
    const { event, config } = this.props

    // TODO: make this better (get event faster? SSR?)
    if (Object.keys(event).length === 0) {
      return <Layout>Loading...</Layout>
    }

    return (
      <Layout>
        <Head>
          <title>{pageTitle(event.name)}</title>
          <script src={this.paywallScriptUrl()} />
        </Head>
        <EventContentBody
          paywallStatus={paywallStatus}
          event={event}
          config={config}
        />
      </Layout>
    )
  }
}

interface ReduxState {
  event: any
}
export const mapStateToProps = (
  { event }: ReduxState,
  { config }: any
): EventContentProps => {
  let lockAddress: string | null = ''
  if (typeof window !== 'undefined' && window.location) {
    const route = lockRoute(window.location.pathname)
    if (route.lockAddress) {
      lockAddress = route.lockAddress
    }
  }

  return {
    lockAddress,
    config,
    event,
  }
}

export default withConfig(connect(mapStateToProps)(EventContent))

const Columns = styled.section`
  margin-top: 10px;
  ${(Media as any).nophone`
display: grid;
grid-gap: 40px;
grid-template-columns: repeat(${(props: any) => props.count || 2}, 1fr);
align-items: start;
padding-left: 20px;
`}
`

const Column = styled.div`
  display: grid;
  align-items: start;
  grid-gap: 10px;
`
