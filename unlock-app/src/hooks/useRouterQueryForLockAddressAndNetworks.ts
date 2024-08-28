import { useSearchParams } from 'next/navigation'
import { useGetLockSettingsBySlug } from './useLockSettings'

export const useRouterQueryForLockAddressAndNetworks = () => {
  const searchParams = useSearchParams()
  const lockAddress = searchParams.get('lockAddress') || undefined
  const network = searchParams.get('network') || undefined
  const slug = searchParams.get('s') || ''
  const tokenId = searchParams.get('tokenId') || ''

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
