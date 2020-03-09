import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import styled from 'styled-components'
import { Card } from '@stripe/stripe-js'
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

interface AccountContentProps {
  emailAddress?: string
  cards?: Card[]
  pageIsLocked: boolean
  dismissPurchaseModal: () => any
}

type PageMode =
  | 'LogIn'
  | 'CollectPaymentDetails'
  | 'ConfirmPurchase'
  | 'Unlocked'

const currentPageMode = (
  pageIsLocked: boolean,
  emailAddress?: string,
  cards?: Card[]
): PageMode => {
  if (!emailAddress) {
    return 'LogIn'
  }
  if (!pageIsLocked) {
    return 'Unlocked'
  }
  if (!cards || !cards.length) {
    return 'CollectPaymentDetails'
  }
  return 'ConfirmPurchase'
}

export const AccountContent = ({
  dismissPurchaseModal,
  emailAddress,
  cards,
  pageIsLocked,
}: AccountContentProps) => {
  const components: Record<PageMode, JSX.Element> = {
    LogIn: <LogInSignUp login />,
    CollectPaymentDetails: (
      <GridPadding>
        <PaymentDetails />
      </GridPadding>
    ),
    ConfirmPurchase: <KeyPurchaseConfirmation />,
    Unlocked: <AlreadyOwned />,
  }

  return (
    <StyledIframeWrapper>
      <Head>
        <title>{pageTitle('Account')}</title>
      </Head>
      <Quit
        backgroundColor="var(--lightgrey)"
        fillColor="var(--grey)"
        action={dismissPurchaseModal}
      />
      <ErrorContainer>
        <Errors />
      </ErrorContainer>
      {components[currentPageMode(pageIsLocked, emailAddress, cards)]}
    </StyledIframeWrapper>
  )
}

interface ReduxState {
  account?: {
    emailAddress?: string
    cards?: Card[]
  }
  pageIsLocked: boolean
}
export const mapStateToProps = ({ account, pageIsLocked }: ReduxState) => {
  const emailAddress = account ? account.emailAddress : undefined
  const cards = account ? account.cards : undefined

  return {
    emailAddress,
    cards,
    pageIsLocked,
  }
}

export const mapDispatchToProps = (dispatch: any) => ({
  dismissPurchaseModal: () => dispatch(dismissPurchaseModal()),
})

export default withConfig(
  connect(mapStateToProps, mapDispatchToProps)(AccountContent)
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
