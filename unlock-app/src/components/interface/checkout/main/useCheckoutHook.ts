import { useQueries } from '@tanstack/react-query'
import { networks } from '@unlock-protocol/networks'
import { HookType } from '@unlock-protocol/types'
import { useSelector } from '@xstate/react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { CheckoutHookType, CheckoutService } from './checkoutMachine'
import { PaywallConfigType } from '@unlock-protocol/core'

type LockHookProps = Record<string, CheckoutHookType | undefined>
const HookIdMapping: Partial<Record<HookType, CheckoutHookType>> = {
  PASSWORD: 'password',
  GUILD: 'guild',
  CAPTCHA: 'captcha',
  GITCOIN: 'gitcoin',
  PROMOCODE: 'promocode',
  PROMO_CODE_CAPPED: 'promocode',
  PASSWORD_CAPPED: 'password',
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

export function useCheckoutHook(service: CheckoutService) {
  const { paywallConfig } = useSelector(service, (state) => state.context)
  const web3Service = useWeb3Service()

  let lockHookMapping: LockHookProps = {}

  const defaultNetwork = paywallConfig.network || 1

  const queries = useQueries({
    queries: [
      ...Object.entries(paywallConfig.locks).map(
        ([lockAddress, { network = defaultNetwork }]) => {
          return {
            queryKey: ['getKeyPurchaseHook', lockAddress, network],
            queryFn: async (): Promise<LockHookProps> => {
              // get hook value
              const hookValue = await web3Service.onKeyPurchaseHook({
                lockAddress,
                network,
              })

              const hookType =
                getOnPurchaseHookTypeFromAddressOnNetwork(hookValue, network) ||
                getOnPurchaseHookTypeFromPaywallConfig(
                  paywallConfig,
                  lockAddress
                )
              return {
                [lockAddress?.toLowerCase()]: hookType,
              }
            },
          }
        }
      ),
    ],
  })

  const isLoading = queries.some(({ isLoading }) => isLoading)

  Object.values(queries).map(({ data, isSuccess }) => {
    if (!isSuccess) return // lets skip this one because is failed
    lockHookMapping = {
      ...lockHookMapping,
      ...data,
    }
  })

  return {
    isLoading,
    lockHookMapping, // mapping lock address and hook state by type
  }
}
