import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import withConfig from '../../utils/withConfig'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Errors from '../interface/Errors'
import AccountInfo from '../interface/user-account/AccountInfo'
import ChangePassword from '../interface/user-account/ChangePassword'
import PaymentDetails from '../interface/user-account/PaymentDetails'
import PaymentMethods from '../interface/user-account/PaymentMethods'

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

  getStripe = () => {
    const {
      config: { stripeApiKey },
    } = this.props
    if (window.Stripe) {
      this.setState({
        stripe: window.Stripe(stripeApiKey),
      })
      if (this.interval) {
        clearInterval(this.interval)
      }
    }
  }

  render() {
    const { stripe } = this.state
    const { cards } = this.props
    return (
      <Layout title="Account Settings">
        <Head>
          <title>{pageTitle('Account Settings')}</title>
          <script id="stripe-js" src="https://js.stripe.com/v3/" async></script>
        </Head>
        <Errors />
        <AccountInfo />
        <ChangePassword />
        {cards.length > 0 && <PaymentMethods cards={cards} />}
        {!cards.length && <PaymentDetails stripe={stripe} />}
      </Layout>
    )
  }
}

interface ReduxState {
  account?: {
    cards?: stripe.Card[]
  }
}

export const mapStateToProps = ({ account }: ReduxState) => {
  let cards: stripe.Card[] = []
  if (account && account.cards) {
    cards = account.cards
  }

  return {
    cards,
  }
}

export default connect(mapStateToProps)(withConfig(SettingsContent))
