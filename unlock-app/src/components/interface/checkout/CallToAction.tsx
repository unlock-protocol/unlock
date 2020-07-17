import React from 'react'
import styled from 'styled-components'
import { PaywallCallToAction } from '../../../unlockTypes'
import { CheckoutState } from '../../../stateMachines/checkout'

export const defaultCallToAction: PaywallCallToAction = {
  default:
    'You have reached your limit of free articles. Please purchase access',
  expired: 'Your access has expired. Please purchase a new key to continue',
  pending: 'Purchase pending...',
  metadata: 'We need to collect some additional information for your purchase.',
  confirmed: 'Purchase confirmed, content unlocked!',
  noWallet:
    'To buy a key you will need to use a crypto-enabled browser that has a wallet. Here are a few options.',
}

// TODO: Handle expired/pending/confirmed cases
export const stateToCTAKey: {
  [state in CheckoutState]: keyof PaywallCallToAction
} = {
  [CheckoutState.loading]: 'default',
  [CheckoutState.fiatLocks]: 'default',
  [CheckoutState.locks]: 'default',
  [CheckoutState.metadataForm]: 'metadata',
  [CheckoutState.notLoggedIn]: 'noWallet',
}

interface CallToActionProps {
  state: any
  callToAction?: PaywallCallToAction
}

export const CallToAction = ({ state, callToAction }: CallToActionProps) => {
  if (state === CheckoutState.loading) {
    return <Message>Loading...</Message>
  }
  const key = stateToCTAKey[state as keyof typeof CheckoutState]
  const message =
    (callToAction && callToAction[key]) || defaultCallToAction[key]
  return <Message>{message}</Message>
}

CallToAction.defaultProps = {
  callToAction: {},
}

const Message = styled.p`
  width: 100%;
`
