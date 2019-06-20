import React from 'react'
import Head from 'next/head'
import withConfig from '../../utils/withConfig'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Errors from '../interface/Errors'
import AccountInfo from '../interface/user-account/AccountInfo'
import ChangePassword from '../interface/user-account/ChangePassword'
import PaymentDetails from '../interface/user-account/PaymentDetails'

// TODO: tighten up this type
declare global {
  interface Window {
    Stripe?: any
  }
}

interface SettingsContentProps {
  config: {
    stripeApiKey: string
  }
}
interface SettingsContentState {
  stripe: any
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
    return (
      <Layout title="Account Settings">
        <Head>
          <title>{pageTitle('Account Settings')}</title>
          <script id="stripe-js" src="https://js.stripe.com/v3/" async></script>
        </Head>
        <Errors />
        <AccountInfo />
        <ChangePassword />
        <PaymentDetails stripe={stripe} />
      </Layout>
    )
  }
}

export default withConfig(SettingsContent)
