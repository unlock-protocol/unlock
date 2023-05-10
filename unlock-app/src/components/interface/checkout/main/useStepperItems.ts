import { useActor } from '@xstate/react'
import { StepItem } from '../Stepper'
import { CheckoutService } from './checkoutMachine'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'

export function useStepperItems(
  service: CheckoutService | UnlockAccountService,
  {
    isRenew,
    isUnlockAccount,
  }: { isRenew?: boolean; isUnlockAccount?: boolean } = {}
) {
  const [state] = useActor(service)

  if (isUnlockAccount) {
    return [
      {
        id: 1,
        name: 'Enter email',
        to: 'ENTER_EMAIL',
      },
      {
        id: 2,
        name: 'Password',
      },
      {
        id: 3,
        name: 'Signed in',
      },
    ]
  }

  const checkoutMachineState = state as unknown as CheckoutService

  const { paywallConfig, skipQuantity, payment, skipRecipient, hook } =
    // @ts-expect-error property 'context' does not exist on type 'Interpreter<CheckoutMachineContext, any, SelectLockEvent | SelectQuantityEvent | SelectPaymentMethodEvent | ... 12 more ... | BackEvent, { ...; }, MarkAllImplementationsAsProvided<...>>'
    checkoutMachineState.context

  const isPassword = hook === 'password'
  const isCaptcha = hook === 'captcha'
  const isPromo = hook === 'promocode'

  const checkoutItems: StepItem[] = [
    {
      id: 1,
      name: 'Select',
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
      skip: skipRecipient && skipQuantity,
    },
    {
      id: 4,
      name: 'Sign message',
      skip: !paywallConfig.messageToSign,
      to: 'MESSAGE_TO_SIGN',
    },
    isPassword
      ? {
          id: 5,
          name: 'Submit password',
          to: 'PASSWORD',
        }
      : isPromo
      ? {
          id: 5,
          name: 'Enter promo code',
          to: 'PROMO',
        }
      : {
          id: 5,
          name: 'Solve captcha',
          to: 'CAPTCHA',
          skip: !isCaptcha || ['card'].includes(payment.method),
        },
    {
      id: 6,
      name: 'Payment method',
      to: 'PAYMENT',
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
      name: 'Select',
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

  return isRenew ? renewItems : checkoutItems
}
