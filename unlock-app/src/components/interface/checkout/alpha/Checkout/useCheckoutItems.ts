import { useActor } from '@xstate/react'
import { StepItem } from '../Stepper'
import { CheckoutService } from './checkoutMachine'

export function useCheckoutSteps(service: CheckoutService) {
  const [state] = useActor(service)
  const { paywallConfig, skipQuantity, payment } = state.context
  const stepItems: StepItem[] = [
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
      name: 'Add card',
      to: 'PAYMENT',
    },
    {
      id: 5,
      name: 'Sign message',
      skip: !paywallConfig.messageToSign,
      to: 'MESSAGE_TO_SIGN',
    },
    {
      id: 6,
      name: 'Solve captcha',
      to: 'CAPTCHA',
      skip:
        !paywallConfig.captcha || ['card', 'claim'].includes(payment.method),
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
  return stepItems
}
