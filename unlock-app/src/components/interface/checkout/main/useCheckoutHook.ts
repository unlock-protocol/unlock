import { useQueries } from '@tanstack/react-query'
import { networks } from '@unlock-protocol/networks'
import { HookType } from '@unlock-protocol/types'
import { useActor } from '@xstate/react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { CheckoutHookType, CheckoutService } from './checkoutMachine'

type LockHookProps = Record<string, CheckoutHookType | undefined>
const HookIdMapping: Partial<Record<HookType, CheckoutHookType>> = {
  PASSWORD: 'password',
  GUILD: 'guild',
  CAPTCHA: 'captcha',
}

export function useCheckoutHook(service: CheckoutService) {
  const [state] = useActor(service)
  const web3Service = useWeb3Service()

  let lockHookMapping: LockHookProps = {}
  const { paywallConfig } = state.context

  const queries = useQueries({
    queries: [
      ...Object.entries(paywallConfig.locks).map(
        ([lockAddress, { network = 1 }]) => {
          return {
            queryKey: ['getKeyPurchaseHook', lockAddress, network],
            queryFn: async (): Promise<LockHookProps> => {
              const onPurchaseHooks = network
                ? networks[network!].hooks?.onKeyPurchaseHook
                : []

              // get hook value
              const hookValue = await web3Service.onKeyPurchaseHook({
                lockAddress,
                network,
              })

              // check for match for hook value
              const match = onPurchaseHooks?.find(
                ({ address }) =>
                  address?.trim()?.toLowerCase() ===
                  hookValue?.trim()?.toLowerCase()
              )

              let hookType: CheckoutHookType | undefined = match?.id
                ? HookIdMapping?.[match?.id]
                : undefined

              // Get hook type from paywall config as fallback

              if (!hookType) {
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
                  hookType = 'password'
                } else if (isCaptcha) {
                  hookType = 'captcha'
                } else if (isPromo) {
                  hookType = 'promocode'
                }
              }

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
