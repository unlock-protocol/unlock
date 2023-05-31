import { useGetLockSettings } from './useLockSettings'
import { useCheckoutConfigsByUser } from './useCheckoutConfig'

interface GetEventLocksProps {
  lockAddress: string
  network: number
}

interface Lock {
  lockAddress: string
  network: number
}

export const useGetEventLocksConfig = ({
  lockAddress,
  network,
}: GetEventLocksProps) => {
  const { isLoading: isLoadingSettings, data: settings } = useGetLockSettings({
    lockAddress,
    network,
  })

  const { isLoading: isLoadingConfigList, data: checkoutConfigList } =
    useCheckoutConfigsByUser()

  const checkoutConfigId = settings?.checkoutConfigId

  // Get checkout id by using the `checkoutConfigId`
  const checkoutConfig =
    checkoutConfigList?.find(
      ({ id }) => id?.toLowerCase() === checkoutConfigId?.toLowerCase()
    )?.config ?? {}

  const checkoutConfigLocks: Lock[] = Object.entries(
    checkoutConfig?.locks ?? {}
  )?.map(([lockAddress, { network }]: any) => {
    return {
      lockAddress,
      network,
    }
  })

  const locks: Lock[] = checkoutConfigId
    ? checkoutConfigLocks
    : [{ lockAddress, network }]

  return {
    isLoading: isLoadingConfigList || isLoadingSettings,
    locks,
    checkoutConfig,
  }
}
