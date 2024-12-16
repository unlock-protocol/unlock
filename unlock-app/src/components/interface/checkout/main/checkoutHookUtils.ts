import { networks } from '@unlock-protocol/networks'
import { HookType } from '@unlock-protocol/types'
import { CheckoutHookType } from './checkoutMachine'
import { PaywallConfigType } from '@unlock-protocol/core'

const HookIdMapping: Partial<Record<HookType, CheckoutHookType>> = {
  PASSWORD: 'password',
  GUILD: 'guild',
  CAPTCHA: 'captcha',
  GITCOIN: 'gitcoin',
  PROMOCODE: 'promocode',
  PROMO_CODE_CAPPED: 'promocode',
  PASSWORD_CAPPED: 'password',
  ALLOW_LIST: 'allowlist',
}

export const getHookType = (lock: any, paywallConfig: PaywallConfigType) => {
  if (!lock) {
    return undefined
  }
  return (
    getOnPurchaseHookTypeFromAddressOnNetwork(
      lock.onKeyPurchaseHook,
      lock.network
    ) || getOnPurchaseHookTypeFromPaywallConfig(paywallConfig, lock.address)
  )
}

export const getOnPurchaseHookTypeFromAddressOnNetwork = (
  hookAddress: string,
  network: number
) => {
  const onPurchaseHooks = network
    ? networks[network].hooks?.onKeyPurchaseHook
    : []

  // check for match for hook value
  const match = onPurchaseHooks?.find(
    ({ address }) =>
      address?.trim()?.toLowerCase() === hookAddress?.trim()?.toLowerCase()
  )

  const hookType: CheckoutHookType | undefined = match?.id
    ? HookIdMapping?.[match?.id]
    : undefined
  return hookType
}

export const getOnPurchaseHookTypeFromPaywallConfig = (
  paywallConfig: PaywallConfigType,
  lockAddress: string
) => {
  const {
    password = false,
    promo = false,
    captcha = false,
  } = paywallConfig.locks?.[lockAddress] ?? {}

  const hookStatePaywall: Record<string, boolean> = {
    isPromo: !!(promo || paywallConfig?.promo),
    isPassword: !!(password || paywallConfig?.password),
    isCaptcha: !!(captcha || paywallConfig?.captcha),
  }

  const { isCaptcha, isPromo, isPassword } = hookStatePaywall
  if (isPassword) {
    return 'password'
  } else if (isCaptcha) {
    return 'captcha'
  } else if (isPromo) {
    return 'promocode'
  }
}
