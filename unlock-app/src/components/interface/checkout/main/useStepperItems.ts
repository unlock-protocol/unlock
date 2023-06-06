import { useActor } from '@xstate/react'
import { StepItem } from '../Stepper'
import {
  CheckoutHookType,
  CheckoutMachineContext,
  CheckoutService,
} from './checkoutMachine'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'
import { shouldSkip } from './utils'

export function useStepperItems(
  service: CheckoutService | UnlockAccountService,
  {
    isRenew,
    isUnlockAccount,
    hookType,
    existingMember: isExistingMember,
  }: {
    isRenew?: boolean
    isUnlockAccount?: boolean
    hookType?: CheckoutHookType
    existingMember?: boolean
  } = {}
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

  const {
    paywallConfig,
    skipQuantity,
    skipRecipient,
    hook,
    existingMember,
    payment,
  } = state.context as CheckoutMachineContext

  const [address, config] = Object.entries(paywallConfig.locks)[0]
  const hasOneLock = Object.keys(paywallConfig.locks).length === 1
  const lockConfig = {
    address,
    ...config,
  }

  const { skipQuantity: skipLockQuantity, skipRecipient: skipLockRecipient } =
    shouldSkip({
      paywallConfig,
      lock: lockConfig,
    })

  const isPassword = hook === 'password' || hookType === 'password'
  const isCaptcha = hook === 'captcha' || hookType === 'captcha'
  const isPromo = hook === 'promocode' || hookType === 'promocode'
  const isGuild = hook === 'guild' || hookType === 'guild'
  const isMember = existingMember || isExistingMember
  const checkoutItems: StepItem[] = [
    {
      name: 'Select',
      to: 'SELECT',
    },
    {
      name: 'Choose quantity',
      skip: !hasOneLock ? skipQuantity : skipLockQuantity,
      to: 'QUANTITY',
    },
    {
      name: 'Add recipients',
      to: 'METADATA',
      skip: !hasOneLock
        ? skipRecipient && skipQuantity && !isMember
        : skipLockQuantity && skipLockRecipient && !isMember,
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
      : isGuild
      ? {
          name: 'Guild',
          to: 'GUILD',
        }
      : {
          name: 'Solve captcha',
          to: 'CAPTCHA',
          skip: !isCaptcha,
        },
    {
      name: 'Payment method',
      to: 'PAYMENT',
    },
    {
      name: 'Add card',
      to: 'CARD',
      skip: !['card', 'universal_card'].includes(payment?.method),
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
      : isPromo
      ? {
          name: 'Enter promo code',
          to: 'PROMO',
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
