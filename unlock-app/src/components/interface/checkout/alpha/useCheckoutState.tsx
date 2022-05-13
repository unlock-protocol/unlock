import { PaywallConfig } from '~/unlockTypes'
import { useState } from 'react'

export type CheckoutState =
  | 'select'
  | 'quantity'
  | 'metadata'
  | 'confirmed'
  | 'card'
  | 'pending'

interface Options {
  initialStage: CheckoutState
  paywallConfig: PaywallConfig
}

const getCheckoutStates = (
  { callToAction = {}, title, locks }: PaywallConfig,
  stage: CheckoutState = 'select'
) => {
  const descriptions = Object.assign(callToAction, {
    pending: 'Purchase pending...',
    default: `${title} has ${
      Object.keys(locks).length
    } membership options, please choose one of the option to continue`,
    quantity:
      'Excellent choice! You might be able to add more than one membership below.',
    metadata:
      'Please enter the required information below in order to included into your NFT.',
    confirmed:
      'Let us prepare the magic, a NFT minting is in progress, you can also follow update in the blockexplorer!',
    card: 'You need to provide card details.',
  })

  const stages = {
    select: {
      title: 'Select membership',
      description: descriptions.default,
    },
    quantity: {
      title: 'Add quantity',
      description: descriptions.quantity,
    },
    metadata: {
      title: 'Enter information',
      description: descriptions.metadata,
    },
    confirmed: {
      title: 'Minting is completed',
      description: descriptions.confirmed,
    },
    pending: {
      title: 'Minting membership NFT',
      message: descriptions.pending,
    },
    card: {
      title: 'Add card',
      description: descriptions.card,
    },
  }
  return stages[stage]
}

export function useCheckout({ initialStage, paywallConfig }: Options) {
  const [stage, setCheckoutStage] = useState<CheckoutState>(initialStage)
  return {
    checkoutState: {
      stage,
      ...getCheckoutStates(paywallConfig, stage),
    },
    setCheckoutStage,
  }
}
