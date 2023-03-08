import { useQuery } from '@tanstack/react-query'
import { networks } from '@unlock-protocol/networks'
import { HookType } from '@unlock-protocol/types'
import { useActor } from '@xstate/react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { CheckoutService } from './checkoutMachine'

export function useCheckoutHook(service: CheckoutService) {
  const [state] = useActor(service)
  const web3Service = useWeb3Service()

  const { paywallConfig } = state.context

  const { isLoading, data: hookMappingState } = useQuery(
    ['getKeyPurchaseHook'],
    async () => {
      let hooks: Record<
        string,
        {
          isPassword: boolean
          isPromo: boolean
          isCaptcha: boolean
        }
      > = {}
      await Promise.all(
        Object.entries(paywallConfig.locks).map(
          async ([lockAddress, props]) => {
            const lockNetwork = props.network || paywallConfig.network || 1
            const onPurchaseHooks = lockNetwork
              ? networks[lockNetwork!].hooks?.onKeyPurchaseHook
              : []

            // get hook value
            const hookValue = await web3Service.onKeyPurchaseHook({
              lockAddress,
              network: lockNetwork!,
            })

            // check for match in networks
            const hookMatchId =
              (hookValue ?? '')?.length > 0 &&
              onPurchaseHooks?.find(({ address }) => address === hookValue)?.id

            const isPassword = hookMatchId === HookType.PASSWORD ?? false

            // todo: replace when custom hook is present in settings
            const isCaptcha =
              paywallConfig.locks[lockAddress]?.captcha ||
              paywallConfig.captcha ||
              false

            // todo: replace when custom hook is present in settings
            const isPromo =
              paywallConfig.locks[lockAddress]?.promo ||
              paywallConfig.promo ||
              false

            // add state for hooks
            hooks = {
              ...hooks,
              [lockAddress]: {
                isPassword,
                isPromo,
                isCaptcha,
              },
            }
          }
        )
      )
      return hooks
    }
  )

  return {
    isLoading,
    hookMappingState, // mapping lock address and hook state by type
  }
}
