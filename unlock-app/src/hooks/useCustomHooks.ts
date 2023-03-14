import { useQuery } from '@tanstack/react-query'
import { ZERO } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'
import { HookMapping } from '~/components/interface/locks/Settings/forms/UpdateHooksForm'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface GetHookValuesProps {
  lockAddress: string
  network: number
  version?: number
}

export function useCustomHook({
  lockAddress,
  network,
  version,
}: GetHookValuesProps) {
  const web3Service = useWeb3Service()

  const getHookValues = async () => {
    let values = {}

    await Promise.all([
      ...Object.entries(HookMapping).map(
        async ([fieldName, { hookName, fromPublicLockVersion = 0 }]) => {
          const hasRequiredVersion: boolean =
            (version ?? 0) >= fromPublicLockVersion ?? false
          if (hasRequiredVersion) {
            const hookValue = await web3Service[hookName]({
              lockAddress,
              network,
            })
            values = {
              ...values,
              [fieldName]: hookValue || ZERO,
            }
          }
        }
      ),
    ])
    return values
  }

  const {
    data: values,
    isLoading,
    refetch,
  } = useQuery(
    ['getHookValues', lockAddress, network],
    async () => await getHookValues(),
    {
      enabled: lockAddress?.length > 0,
    }
  )

  return {
    isLoading,
    refetch,
    values,
    getHookValues,
  }
}
