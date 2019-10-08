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
import { GridPadding, IframeWrapper } from '../interface/user-account/styles'
import Close from '../interface/buttons/layout/Close'
import { dismissPurchaseModal } from '../../actions/keyPurchase'
import svg from '../interface/svg'

interface StripeWindow {
  Stripe?: stripe.StripeStatic
}

declare global {
  interface Window extends StripeWindow {}
}

interface AccountContentProps {
  emailAddress?: string
  cards?: stripe.Card[]
  pageIsLocked: boolean
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

type PageMode =
  | 'LogIn'
  | 'CollectPaymentDetails'
  | 'ConfirmPurchase'
  | 'Unlocked'

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
      CollectPaymentDetails: (
        <GridPadding>
          <PaymentDetails stripe={stripe} />
        </GridPadding>
      ),
      ConfirmPurchase: <KeyPurchaseConfirmation />,
      Unlocked: <AlreadyOwned />,
    }

    return components[mode]
  }

  currentPageMode = (): PageMode => {
    const { emailAddress, cards, pageIsLocked } = this.props
    if (!emailAddress) {
      return 'LogIn'
    } else if (!pageIsLocked) {
      return 'Unlocked'
    } else if (!cards || !cards.length) {
      return 'CollectPaymentDetails'
    } else {
      return 'ConfirmPurchase'
    }
  }

  setStripe = (s: stripe.StripeStatic) => {
    const {
      config: { stripeApiKey },
    } = this.props
    this.setState({
      stripe: s(stripeApiKey),
    })
  }

  getStripe = () => {
    getStripeHelper(window, this.interval, this.setStripe)
  }

  handleClose = () => {
    const { dismissPurchaseModal } = this.props
    dismissPurchaseModal()
  }

  render() {
    const mode = this.currentPageMode()
    return (
      <StyledIframeWrapper>
        <Head>
          <title>{pageTitle('Account')}</title>
          <script src="https://js.stripe.com/v3/" async />
        </Head>
        <Quit
          backgroundColor="var(--lightgrey)"
          fillColor="var(--grey)"
          action={this.handleClose}
        />
        <ErrorContainer>
          <Errors />
        </ErrorContainer>
        {this.getComponent(mode)}
      </StyledIframeWrapper>
    )
  }
}

interface ReduxState {
  account?: {
    emailAddress?: string
    cards?: stripe.Card[]
  }
  pageIsLocked: boolean
}
export const mapStateToProps = ({ account, pageIsLocked }: ReduxState) => {
  let props: AccountContentProps = {
    pageIsLocked,
  }

  if (account) {
    const { emailAddress, cards } = account
    if (emailAddress) {
      props.emailAddress = emailAddress
    }
    if (account.cards) {
      props.cards = cards
    }
  }

  return props
}

export const mapDispatchToProps = (dispatch: any) => ({
  dismissPurchaseModal: () => dispatch(dismissPurchaseModal()),
})

export const getStripeHelper = (
  window: StripeWindow,
  interval: number | null,
  setStripe: (s: stripe.StripeStatic) => void
) => {
  const { Stripe } = window
  if (Stripe) {
    setStripe(Stripe)
    if (interval) {
      clearInterval(interval)
    }
  }
}

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AccountContent)
)

const Quit = styled(Close)`
  position: absolute;
  right: 16px;
  top: 16px;
`

const ErrorContainer = styled.div`
  margin: 32px 48px 0 32px;
`

const StyledIframeWrapper = styled(IframeWrapper)`
  max-width: 456px;
`

const AlreadyOwnedWrapper = styled.div`
  color: var(--slate);
  margin: 16px 32px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const CircleCheck = styled(svg.Checkmark)`
  width: 48px;
  border: thin var(--slate) solid;
  border-radius: 48px;
  margin-right: 16px;
`

const AlreadyOwned = () => {
  return (
    <AlreadyOwnedWrapper>
      <CircleCheck />
      You already own a key to this lock!
    </AlreadyOwnedWrapper>
  )
}
