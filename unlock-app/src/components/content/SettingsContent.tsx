import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import withConfig from '../../utils/withConfig'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Errors from '../interface/Errors'
import AccountInfo from '../interface/user-account/AccountInfo'
import PaymentDetails from '../interface/user-account/PaymentDetails'
import PaymentMethods from '../interface/user-account/PaymentMethods'
import EjectAccount from '../interface/user-account/EjectAccount'
import LogInSignUp from '../interface/LogInSignUp'

// TODO: tighten up this type
declare global {
  interface Window {
    Stripe?: stripe.StripeStatic
  }
}

interface SettingsContentProps {
  config: {
    stripeApiKey: string
  }
  account: {
    emailAddress?: string
  } | null
  cards: stripe.Card[]
}
interface SettingsContentState {
  stripe: stripe.Stripe | null
}

export class SettingsContent extends React.Component<
  SettingsContentProps,
  SettingsContentState
> {
  interval: number | null

  constructor(props: SettingsContentProps) {
    super(props)
    this.state = {
      stripe: null,
    }
    this.interval = null
  }

  componentDidMount() {
    // componentDidMount only runs in the browser; this is necessary to listen
    // for the stripe-js load event which *cannot* be rendered server side
    this.interval = setInterval(this.getStripe, 500)
  }

  componentWillUnmount() {
    this.removeInterval()
  }

  getStripe = () => {
    const {
      config: { stripeApiKey },
    } = this.props
    if (window.Stripe) {
      this.setState({
        stripe: window.Stripe(stripeApiKey),
      })
      this.removeInterval()
    }
  }

  removeInterval() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  render() {
    const { stripe } = this.state
    const { cards, account } = this.props

    return (
      <Layout title="Account Settings">
        <Head>
          <title>{pageTitle('Account Settings')}</title>
          <script id="stripe-js" src="https://js.stripe.com/v3/" async />
        </Head>
        <Errors />
        {account && account.emailAddress && (
          <>
            <AccountInfo />
            {cards.length > 0 && <PaymentMethods cards={cards} />}
            {stripe && !cards.length && <PaymentDetails stripe={stripe} />}
            <EjectAccount />
          </>
        )}
        {!account && <LogInSignUp login />}
        {account && !account.emailAddress && (
          <p>
            This page contains settings for managed account users. Crypto users
            (like you!) don&apos;t need it.
          </p>
        )}
      </Layout>
    )
  }
}

interface ReduxState {
  account: {
    cards?: stripe.Card[]
  } | null
}

export const mapStateToProps = ({ account }: ReduxState) => {
  let cards: stripe.Card[] = []
  if (account && account.cards) {
    cards = account.cards
  }

  return {
    account,
    cards,
  }
}

export default connect(mapStateToProps)(withConfig(SettingsContent))
