import { networks } from '@unlock-protocol/networks'
import { HookType } from '@unlock-protocol/types'
import { CheckoutHookType } from './checkoutMachine'
import { PaywallConfigType } from '@unlock-protocol/core'
import axios from 'axios'
import { toast } from 'react-hot-toast'

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
    console.log('DUPLICATE REQUEST!! Skipping...', event, body)
    return
  }

  prevBody = JSON.stringify(body)

  const sendWebhookRequest = async (attempt: number) => {
    await axios.post(url, body)
    toast.success(`Sent ${event} event data to ${url} on attempt ${attempt}`)
  }

  const retryRequest = async (maxRetries: number) => {
    let lastError: any
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        attempt++
        await sendWebhookRequest(attempt)
        return
      } catch (error) {
        lastError = error
        toast.error(
          `Could not post ${event} event data to ${url}. Attempt ${attempt}`
        )
        if (attempt < maxRetries) {
          const delay = attempt === 1 ? 1000 : 3000
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    setTimeout(() => {
      lastError &&
        attempt === maxRetries &&
        toast.error(`Failed to post ${event} event data to ${url}`)
    }, 2000)

    throw lastError
  }

  try {
    await retryRequest(3)
  } catch (error) {
    console.error('Webhook request failed:', error)
  }
}
