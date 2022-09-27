import { useActor } from '@xstate/react'
import { StepItem } from '../Stepper'
import { CheckoutService } from './checkoutMachine'

export function useCheckoutSteps(service: CheckoutService, renewal = false) {
  const [state] = useActor(service)
  const { paywallConfig, skipQuantity, payment, lock } = state.context

  const lockAddress = lock?.address || ''

  const isCaptcha =
    paywallConfig.locks[lockAddress]?.captcha || paywallConfig.captcha
  const isPassword =
    paywallConfig.locks[lockAddress]?.password || paywallConfig.password

  const checkoutItems: StepItem[] = [
    {
      id: 1,
      name: 'Select lock',
      to: 'SELECT',
    },
    {
      id: 2,
      name: 'Choose quantity',
      skip: skipQuantity,
      to: 'QUANTITY',
    },
    {
      id: 3,
      name: 'Add recipients',
      to: 'METADATA',
    },
    {
      id: 4,
      name: 'Payment method',
      to: 'PAYMENT',
    },
    {
      id: 5,
      name: 'Sign message',
      skip: !paywallConfig.messageToSign,
      to: 'MESSAGE_TO_SIGN',
    },
    isPassword
      ? {
          id: 6,
          name: 'Submit password',
          to: 'PASSWORD',
        }
      : {
          id: 6,
          name: 'Solve captcha',
          to: 'CAPTCHA',
          skip: !isCaptcha || ['card', 'claim'].includes(payment.method),
        },
    {
      id: 7,
      name: 'Confirm',
      to: 'CONFIRM',
    },
    {
      id: 8,
      name: 'Minting NFT',
    },
  ]

  const renewItems: StepItem[] = [
    {
      id: 1,
      name: 'Select lock',
      to: 'SELECT',
    },
    isPassword
      ? {
          id: 2,
          name: 'Submit password',
          to: 'PASSWORD',
        }
      : {
          id: 2,
          name: 'Solve captcha',
          to: 'CAPTCHA',
          skip: !isCaptcha,
        },
    {
      id: 3,
      name: 'Renew membership',
      to: 'RENEW',
    },
    {
      id: 4,
      name: 'Renewed!',
    },
  ]

  return renewal ? renewItems : checkoutItems
}
