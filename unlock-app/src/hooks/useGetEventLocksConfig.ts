import { useGetLockSettings } from './useLockSettings'
import { useCheckoutConfig } from './useCheckoutConfig'

interface GetEventLocksProps {
  lockAddress: string
  network: number
}

interface Lock {
  lockAddress: string
  network: number
}

/** Returns list of locks from checkout config or the default locks if none */
export const useGetEventLocksConfig = ({
  lockAddress,
  network,
}: GetEventLocksProps) => {
  const { isLoading: isLoadingSettings, data: settings } = useGetLockSettings({
    lockAddress,
    network,
  })

  const checkoutConfigId = settings?.checkoutConfigId ?? ''

  // get checkout config with the saved checkoutConfigId
  const { isInitialLoading: isLoadingConfigList, data } = useCheckoutConfig({
    id: checkoutConfigId,
  })

  const checkoutConfig = data?.config
  const configLocks = checkoutConfig?.locks ?? {}

  const checkoutConfigLocks: Lock[] = Object.entries(configLocks)?.map(
    ([lockAddress, { network }]: any) => {
      return {
        lockAddress,
        network,
      }
    }
  )

  // locks from checkout config if exists otherwise fallback to lockAddress + network
  const locks: Lock[] = checkoutConfigId
    ? checkoutConfigLocks
    : [{ lockAddress, network }]

  return {
    isLoading: isLoadingConfigList || isLoadingSettings,
    locks,
    checkoutConfig,
  }
}
