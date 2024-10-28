import { useQueries, useQuery } from '@tanstack/react-query'
import { PaywallLocksConfigType } from '@unlock-protocol/core'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useAuthenticate } from './useAuthenticate'

interface ValidKeyProps {
  lockAddress: string
  network: number
}

export const useValidKey = ({ lockAddress, network }: ValidKeyProps) => {
  const { account } = useAuthenticate()

  const web3Service = useWeb3Service()
  return useQuery({
    queryKey: ['hasValidKey', network, lockAddress, account],
    queryFn: async () => {
      if (!account) {
        return false
      }
      return web3Service.getHasValidKey(lockAddress, account!, network)
    },
    enabled: !!account,
  })
}

/** Check if there is a valid keys from a list of Locks */
export const useValidKeyBulk = (locks: PaywallLocksConfigType) => {
  const { account } = useAuthenticate()

  const web3Service = useWeb3Service()

  return useQueries({
    queries: Object.keys(locks).map((lockAddress) => {
      const network = locks[lockAddress].network
      return {
        queryKey: ['validKeyForKey', lockAddress, account, network],
        queryFn: async () => {
          if (!account) {
            return false
          }
          return web3Service.getHasValidKey(lockAddress, account!, network!)
        },
        enabled: !!account,
      }
    }),
  })
}
