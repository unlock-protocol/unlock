import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import withConfig from '../../utils/withConfig'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Errors from '../interface/Errors'
import PaymentDetails from '../interface/user-account/PaymentDetails'
import LogInSignUp from '../interface/LogInSignUp'
import KeyPurchaseConfirmation from '../interface/user-account/KeyPurchaseConfirmation'

declare global {
  interface Window {
    Stripe?: stripe.StripeStatic
  }
}

interface AccountContentProps {
  emailAddress?: string
  cards?: stripe.Card[]
}

interface FullAccountContentProps extends AccountContentProps {
  config: {
    stripeApiKey: string
  }
}
interface AccountContentState {
  stripe: stripe.Stripe | null
}

type PageMode = 'LogIn' | 'CollectPaymentDetails' | 'ConfirmPurchase'

export class AccountContent extends React.Component<
  FullAccountContentProps,
  AccountContentState
> {
  interval: number | null
  constructor(props: FullAccountContentProps) {
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

  getComponent = (mode: PageMode) => {
    const { stripe } = this.state
    const components: Record<PageMode, JSX.Element> = {
      LogIn: <LogInSignUp login />,
      CollectPaymentDetails: <PaymentDetails stripe={stripe} />,
      ConfirmPurchase: <KeyPurchaseConfirmation />,
    }

    return components[mode]
  }

  currentPageMode = (): PageMode => {
    const { emailAddress, cards } = this.props
    if (!emailAddress) {
      return 'LogIn'
    } else if (!cards) {
      return 'CollectPaymentDetails'
    } else {
      return 'ConfirmPurchase'
    }
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
    const mode = this.currentPageMode()
    return (
      <Layout title="Account">
        <Head>
          <title>{pageTitle('Account')}</title>
          <script src="https://js.stripe.com/v3/" async />
        </Head>
        <Errors />
        {this.getComponent(mode)}
      </Layout>
    )
  }
}

interface ReduxState {
  account?: {
    emailAddress?: string
    cards?: stripe.Card[]
  }
}
export const mapStateToProps = (state: ReduxState) => {
  let props: AccountContentProps = {}

  if (state.account) {
    const { emailAddress, cards } = state.account
    if (emailAddress) {
      props.emailAddress = emailAddress
    }
    if (state.account.cards) {
      props.cards = cards
    }
  }

  return props
}

export default withConfig(connect(mapStateToProps)(AccountContent))
