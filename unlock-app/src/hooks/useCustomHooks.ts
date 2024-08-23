import { useQuery } from '@tanstack/react-query'
import { HookMapping } from '~/components/interface/locks/Settings/forms/UpdateHooksForm'
import { ADDRESS_ZERO } from '~/constants'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface GetHookValuesProps {
  lockAddress: string
  network: number
  version?: bigint
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
            (version ?? 0) >= fromPublicLockVersion
          if (hasRequiredVersion) {
            const hookValue = await web3Service[hookName]({
              lockAddress,
              network,
            })
            values = {
              ...values,
              [fieldName]: hookValue || ADDRESS_ZERO,
            }
          }
        }
      ),
    ])
    return values
  }

  const {
    data: values,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['getHookValues', lockAddress, network],
    queryFn: getHookValues,
    enabled: lockAddress?.length > 0,
  })

  return {
    isPending,
    refetch,
    values,
    getHookValues,
  }
}
