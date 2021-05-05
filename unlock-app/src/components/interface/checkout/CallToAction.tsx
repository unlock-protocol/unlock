import React from 'react'
import styled from 'styled-components'
import { PaywallCallToAction } from '../../../unlockTypes'

export const defaultCallToAction: PaywallCallToAction = {
  default: 'Purchase your NFT membership now!',
  expired: 'Your access has expired. Please purchase a new key to continue',
  pending: 'Purchase pending...',
  metadata: 'We need to collect some additional information for your purchase.',
  confirmed: 'Purchase confirmed, you are now a member',
  card: 'Please, enter your credit card details.',
  noWallet:
    'To buy a key you will need to use a crypto-enabled browser that has a wallet. Here are a few options.',
}
interface CallToActionProps {
  state: string
  callToAction?: PaywallCallToAction
}

export const CallToAction = ({ state, callToAction }: CallToActionProps) => {
  const message =
    (callToAction && callToAction[state]) || defaultCallToAction[state]
  return <Message>{message}</Message>
}

CallToAction.defaultProps = {
  callToAction: {},
}

const Message = styled.p`
  text-align: left;
  font-size: 13px;
  width: 100%;
`
