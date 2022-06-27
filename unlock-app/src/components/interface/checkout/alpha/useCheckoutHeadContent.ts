import { PaywallConfig } from '~/unlockTypes'
import { CheckoutPage } from './Checkout/checkoutMachine'

export function useCheckoutHeadContent(
  { callToAction = {}, title, locks }: PaywallConfig,
  page: CheckoutPage = 'SELECT'
) {
  const descriptions = Object.assign(
    {
      minting:
        'NFT minting is in progress, you can follow update in the blockexplorer!',
      default: `${title} has ${
        Object.keys(locks).length
      } membership options, please choose one of the option to continue`,
      quantity:
        'Excellent choice! You might be able to add more than one membership below.',
      metadata:
        'Please enter the required information below in order to included into your NFT.',
      confirmed: "Let's have a last look before we process the payment.",
      card: "Let's choose the card to pay for the NFT membership. Add card if you don't any.",
      messageToSign: 'You need to sign the message provided by the lock owner.',
      captcha: 'You need to solve captcha to continue.',
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
      title: 'Existing member',
      description: 'You already have a valid membership',
    },
    UNLOCK_ACCOUNT: {
      title: 'Sign in / up',
      description:
        "Let us onboard you to the beauty of blockchain, even if you don't have a wallet yet. :D",
    },
  }
  return pages[page]
}
