import React from 'react'
import { PaywallCallToAction } from '../../../unlockTypes'

export const defaultCallToAction: PaywallCallToAction = {
  default: 'Unlock your NFT membership now!',
  expired:
    'Your membership has expired. Please purchase a new one to continue.',
  pending: 'Purchase pending...',
  metadata: 'We need to collect some additional information for your purchase.',
  confirmed: 'Purchase confirmed, you are now a member',
  card: 'Please, enter your credit card details.',
  noWallet:
    'To buy a key you will need to use a crypto-enabled browser that has a wallet. Here are a few options.',
  quantity: 'You might be able add more than one membership',
}

interface CallToActionProps {
  state: string
  callToAction?: Partial<PaywallCallToAction>
}

export const CallToAction = ({ state, callToAction }: CallToActionProps) => {
  const message =
    (callToAction && callToAction[state]) || defaultCallToAction[state]
  return <span className="w-full text-left min-h-[30px]">{message}</span>
}

CallToAction.defaultProps = {
  callToAction: {},
}
