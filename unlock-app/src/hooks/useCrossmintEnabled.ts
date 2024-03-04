import { useGetLockSettings } from './useLockSettings'

interface CrossmintEnabledProps {
  lockAddress: string
  network: number
  recipients: string[]
}

interface CrossmintEnabledResponse {
  crossmintEnabled: boolean
  collectionId: string
  projectId: string
  isLoading: boolean
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

  // Disabled if there are multiple recipients or if no crossmint client id is set
  if (recipients?.length !== 1 || !settings?.crossmintClientId) {
    return {
      ...rest,
      crossmintEnabled: false,
      collectionId: '',
      projectId: '',
    } as CrossmintEnabledResponse
  }

  const [collectionId, projectId] = settings.crossmintClientId.split('/')
  return {
    ...rest,
    collectionId,
    projectId,
    crossmintEnabled: true,
  } as CrossmintEnabledResponse
}
