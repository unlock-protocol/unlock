import { useQuery } from '@tanstack/react-query'

interface CrossmintEnabledProps {
  lockAddress: string
  network: number
}

interface CrossmintConfigs {
  [lockAddress: string]: string
}

export const useCrossmintEnabled = ({
  lockAddress,
  network,
}: CrossmintEnabledProps) => {
  return useQuery(['useCrossmintEnabled', lockAddress, network], async () => {
    // TODO: move to backend
    const crossmintClientIds: CrossmintConfigs = {
      '0xa79dff775b5b259a33c4179c7de9c648fb4ab762':
        '1d837cfc-6299-47b4-b5f9-462d5df00f33',
      '0x41afecba16313d6b02beb5e68c69455b91450065':
        '966895c5-da5b-4f08-b6fd-ed12055c4d06',
    }
    return crossmintClientIds[lockAddress]
  })
}
