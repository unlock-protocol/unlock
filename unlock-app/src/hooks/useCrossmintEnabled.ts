import { useGetLockSettings } from './useLockSettings'

interface CrossmintEnabledProps {
  lockAddress: string
  network: number
  recipients: string[]
}

export const useCrossmintEnabled = ({
  recipients,
  lockAddress,
  network,
}: CrossmintEnabledProps) => {
  const { data: settings, ...rest } = useGetLockSettings({
    lockAddress,
    network,
  })

  // Disabled if there are multiple recipients
  if (recipients?.length !== 1) {
    return { ...rest, crossmintClientId: null }
  }

  return { ...rest, crossmintClientId: settings?.crossmintClientId }
}
