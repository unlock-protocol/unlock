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
        name: 'Enter email',
        to: 'ENTER_EMAIL',
      },
      {
        name: 'Password',
      },
      {
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
      name: 'Select',
      to: 'SELECT',
    },
    {
      name: 'Choose quantity',
      skip: skipQuantity,
      to: 'QUANTITY',
    },
    {
      name: 'Add recipients',
      to: 'METADATA',
      skip: skipRecipient && skipQuantity,
    },
    {
      name: 'Sign message',
      skip: !paywallConfig.messageToSign,
      to: 'MESSAGE_TO_SIGN',
    },
    isPassword
      ? {
          name: 'Submit password',
          to: 'PASSWORD',
        }
      : isPromo
      ? {
          name: 'Enter promo code',
          to: 'PROMO',
        }
      : {
          name: 'Solve captcha',
          to: 'CAPTCHA',
          skip: !isCaptcha || ['card'].includes(payment.method),
        },
    {
      name: 'Payment method',
      to: 'PAYMENT',
    },
    {
      name: 'Pay with card',
      to: 'UNIVERSAL_CARD',
    },
    {
      name: 'Confirm',
      to: 'CONFIRM',
    },
    {
      name: 'Minting NFT',
    },
  ]

  const renewItems: StepItem[] = [
    {
      name: 'Select',
      to: 'SELECT',
    },
    isPassword
      ? {
          name: 'Submit password',
          to: 'PASSWORD',
        }
      : {
          name: 'Solve captcha',
          to: 'CAPTCHA',
          skip: !isCaptcha,
        },
    {
      name: 'Renew membership',
      to: 'RENEW',
    },
    {
      name: 'Renewed!',
    },
  ]

  return isRenew ? renewItems : checkoutItems
}
