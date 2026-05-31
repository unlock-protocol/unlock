import { Hook, HookType } from '@unlock-protocol/types'

interface AccessCodeNetworkConfig {
  hooks?: {
    onKeyPurchaseHook?: Hook[]
  }
}

export const getAccessCodeHookType = (isPaidLock: boolean) => {
  return isPaidLock ? HookType.PROMO_CODE_CAPPED : HookType.PASSWORD_CAPPED
}

export const getAccessCodeHookAddress = (
  networkConfig: AccessCodeNetworkConfig | undefined,
  isPaidLock: boolean
) => {
  const hookType = getAccessCodeHookType(isPaidLock)
  return (
    networkConfig?.hooks?.onKeyPurchaseHook?.find(
      (hook) => hook.id === hookType
    )?.address ?? ''
  )
}
