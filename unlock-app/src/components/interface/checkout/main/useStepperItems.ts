import { useActor } from '@xstate/react'
import { StepItem } from '../Stepper'
import {
  CheckoutHookType,
  CheckoutMachineContext,
  CheckoutService,
} from './checkoutMachine'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'
import { shouldSkip } from './utils'
import { translate } from '~/i18n'

export function useStepperItems(
  service: CheckoutService | UnlockAccountService,
  {
    isUnlockAccount,
    hookType,
    isRenew,
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
        name: translate('common.enter_email'),
        to: 'ENTER_EMAIL',
      },
      {
        name: translate('password.password_title'),
      },
      {
        name: translate('common.signed_in'),
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
    renew,
  } = state.context as CheckoutMachineContext
  if (!paywallConfig.locks || Object.keys(paywallConfig.locks).length === 0) {
    return []
  }
  const [address, config] = Object.entries(paywallConfig.locks)[0]
  const hasOneLock = Object.keys(paywallConfig.locks).length === 1
  const lockConfig = {
    address,
    ...config,
  }

  const isExpired = isRenew || renew
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
      name: translate('common.select'),
      to: 'SELECT',
    },
    {
      name: translate('common.choose_quantity'),
      skip: (!hasOneLock ? skipQuantity : skipLockQuantity) || isExpired,
      to: 'QUANTITY',
    },
    {
      name: translate('common.recipient'),
      to: 'METADATA',
      skip:
        (!hasOneLock
          ? skipRecipient && skipQuantity && !isMember
          : skipLockQuantity && skipLockRecipient && !isMember) || isExpired,
    },
    {
      name: translate('common.sign_message_title'),
      skip: !paywallConfig.messageToSign,
      to: 'MESSAGE_TO_SIGN',
    },
    isPassword
      ? {
          name: translate('password.submit_password'),
          to: 'PASSWORD',
        }
      : isPromo
      ? {
          name: translate('promo.enter_promo_code'),
          to: 'PROMO',
        }
      : isGuild
      ? {
          name: translate('common.guild'),
          to: 'GUILD',
        }
      : {
          name: translate('captcha.Captcha'),
          to: 'CAPTCHA',
          skip: !isCaptcha,
        },
    {
      name: translate('common.payment_method_title'),
      to: 'PAYMENT',
    },
    {
      name: translate('common.add_card'),
      to: 'CARD',
      skip: !['card', 'universal_card'].includes(payment?.method),
    },
    {
      name: translate('common.confirm'),
      to: 'CONFIRM',
    },
    {
      name: translate('minting.minting_nft'),
    },
  ]

  return checkoutItems
}
