import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Errors from '../interface/Errors'
import PaymentDetails from '../interface/user-account/PaymentDetails'

declare global {
  interface Window {
    Stripe?: stripe.StripeStatic
  }
}

interface AccountContentProps {
  config: {
    stripeApiKey: string
  }
}
interface AccountContentState {
  stripe: stripe.Stripe | null
}

export class AccountContent extends React.Component<
  AccountContentProps,
  AccountContentState
> {
  interval: number | null
  constructor(props: AccountContentProps) {
    super(props)
    this.state = {
      stripe: null,
    }
    this.interval = null
  }

  componentDidMount() {
    // componentDidMount only runs in the browser; this is necessary to check
    // for the stripe-js library which *cannot* be rendered server side
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
    return (
      <Layout title="Account">
        <Head>
          <title>{pageTitle('Account')}</title>
          <script src="https://js.stripe.com/v3/" async />
        </Head>
        <Errors />
        <PaymentDetails stripe={stripe} />
      </Layout>
    )
  }
}

export default AccountContent
