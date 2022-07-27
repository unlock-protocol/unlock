import { CheckoutPage, CheckoutService } from './Checkout/checkoutMachine'
import { useActor } from '@xstate/react'

export function useCheckoutHeadContent(checkoutService: CheckoutService) {
  const [state] = useActor(checkoutService)
  const matched = state.value.toString() as CheckoutPage
  const {
    paywallConfig: { locks, callToAction, icon },
  } = state.context

  const descriptions = Object.assign(
    {
      minting:
        'NFT minting is in progress, you can follow update in the blockexplorer!',
      default: `There are ${
        Object.keys(locks).length
      } membership options, please choose one to continue`,
      quantity:
        'Excellent choice! You might be able to add more than one membership below.',
      metadata:
        'Please enter the required information below in order to include it into your NFT.',
      payment: 'Please select one of the payment methods to continue.',
      confirmed: "Let's have a last look before we process the payment.",
      card: "Let's choose the card to pay for the NFT membership.",
      messageToSign: 'Please sign the message provided by the lock owner.',
      captcha: 'Please solve the captcha to continue.',
      returning:
        'We detected there is a membership NFT in your wallet, enjoy it!',
    },
    callToAction
  )

  const pages: Record<CheckoutPage, Record<'title' | 'description', string>> = {
    SELECT: {
      title: 'Select membership',
      description: descriptions.default,
    },
    QUANTITY: {
      title: 'Add quantity',
      description: descriptions.quantity,
    },
    METADATA: {
      title: 'Enter information',
      description: descriptions.metadata,
    },
    CONFIRM: {
      title: 'Minting will start',
      description: descriptions.confirmed,
    },
    MINTING: {
      title: 'Minting membership NFT',
      description: descriptions.minting,
    },
    PAYMENT: {
      title: 'Choose Payment',
      description: descriptions.payment,
    },
    CARD: {
      title: 'Add card',
      description: descriptions.card,
    },
    MESSAGE_TO_SIGN: {
      title: 'Sign Message',
      description: descriptions.messageToSign,
    },
    CAPTCHA: {
      title: 'Solve captcha',
      description: descriptions.captcha,
    },
    RETURNING: {
      title: 'You have it!',
      description: descriptions.returning,
    },
    UNLOCK_ACCOUNT: {
      title: 'Sign in / up',
      description:
        "Let us onboard you to the beauty of blockchain, even if you don't have a wallet yet. :D",
    },
  }
  return {
    ...pages[matched],
    iconURL: icon,
  }
}
