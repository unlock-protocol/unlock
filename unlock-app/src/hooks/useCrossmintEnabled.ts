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
  console.log(settings)

  // False if there are multiple  recipients
  if (recipients?.length !== 1) {
    return false
  }

  return { ...rest }

  // return useQuery(
  //   ['useCrossmintEnabled', lockAddress, network, recipients],
  //   async () => {
  //     // TODO: move to backend
  //     const crossmintClientIds: CrossmintConfigs = {
  //       '0xa79dff775b5b259a33c4179c7de9c648fb4ab762':
  //         '1d837cfc-6299-47b4-b5f9-462d5df00f33',
  //       '0x41afecba16313d6b02beb5e68c69455b91450065':
  //         '966895c5-da5b-4f08-b6fd-ed12055c4d06',
  //     }
  //     return crossmintClientIds[lockAddress]
  //   }
  // )
}
