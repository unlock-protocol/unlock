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

  const { data: lockSettings, isLoading } = useGetLockSettingsBySlug(
    slug as string
  )

  return {
    isLoading,
    lockAddress: (lockSettings
      ? lockSettings?.lockAddress
      : lockAddress) as string,
    network: Number(lockSettings ? lockSettings?.network : network),
    tokenId,
  }
}
