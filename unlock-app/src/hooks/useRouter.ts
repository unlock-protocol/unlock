import { useRouter } from 'next/router'
import { useGetLockSettingsBySlug } from './useLockSettings'

export const useRouterQueryForLockAddressAndNetworks = () => {
  const router = useRouter()
  const query = router?.query as {
    lockAddress?: string
    network?: string
    s?: string
    tokenId: string
  }
  const { lockAddress, network, s: slug = '', tokenId } = query

  const {
    isLoading,
    isFetching,
    data: lockSettings,
  } = useGetLockSettingsBySlug(slug as string)

  return {
    lockAddress: (lockSettings
      ? lockSettings?.lockAddress
      : lockAddress) as string,
    network: Number(lockSettings ? lockSettings?.network : network),
    tokenId,
    isLoading: isFetching && isLoading,
  }
}
