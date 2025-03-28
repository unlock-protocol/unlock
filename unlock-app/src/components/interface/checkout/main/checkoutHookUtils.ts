import { networks } from '@unlock-protocol/networks'
import { HookType } from '@unlock-protocol/types'
import { CheckoutHookType } from './checkoutMachine'
import { PaywallConfigType } from '@unlock-protocol/core'
import { locksmith } from '~/config/locksmith'

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

let prevBody: string | null = null
export const postToWebhook = async (body: any, config: any, event: string) => {
  const url = config?.hooks && config.hooks[event]
  if (!url) return

  if (JSON.stringify(body) === prevBody) {
    return
  }
  prevBody = JSON.stringify(body)

  try {
    const checkoutId = new URL(window.location.href).searchParams.get('id')
    await locksmith.addCheckoutHookJob(checkoutId!, { data: body, event })
  } catch (error) {
    console.error('job not added')
  }
}
