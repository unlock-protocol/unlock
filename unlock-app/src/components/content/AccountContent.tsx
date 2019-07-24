import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import styled from 'styled-components'
import withConfig from '../../utils/withConfig'
import { pageTitle } from '../../constants'
import Errors from '../interface/Errors'
import PaymentDetails from '../interface/user-account/PaymentDetails'
import LogInSignUp from '../interface/user-account/LogInSignUp'
import KeyPurchaseConfirmation from '../interface/user-account/KeyPurchaseConfirmation'
import { IframeWrapper } from '../interface/user-account/styles'
import Close from '../interface/buttons/layout/Close'
import { dismissPurchaseModal } from '../../actions/keyPurchase'

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
  dismissPurchaseModal: () => any
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
    } else if (!cards || !cards.length) {
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
    const { dismissPurchaseModal } = this.props
    const mode = this.currentPageMode()
    return (
      <IframeWrapper>
        <Head>
          <title>{pageTitle('Account')}</title>
          <script src="https://js.stripe.com/v3/" async />
        </Head>
        <Quit
          backgroundColor="var(--lightgrey)"
          fillColor="var(--grey)"
          action={dismissPurchaseModal}
        />
        <Errors />
        {this.getComponent(mode)}
      </IframeWrapper>
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

export const mapDispatchToProps = (dispatch: any) => ({
  dismissPurchaseModal: () => dispatch(dismissPurchaseModal()),
})

export default withConfig(connect(mapStateToProps)(AccountContent))

const Quit = styled(Close)`
  position: absolute;
  right: 24px;
  top: 24px;
`
