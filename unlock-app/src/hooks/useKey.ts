import { useQueries, useQuery } from '@tanstack/react-query'
import { PaywallLocksConfigType } from '@unlock-protocol/core'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface ValidKeyProps {
  lockAddress: string
  network: number
}

export const useValidKey = ({ lockAddress, network }: ValidKeyProps) => {
  const { account } = useAuth()

  const web3Service = useWeb3Service()
  return useQuery(
    ['hasValidKey', network, lockAddress, account],
    async () => {
      if (!account) {
        return false
      }
      return web3Service.getHasValidKey(lockAddress, account!, network)
    },
    {
      enabled: !!account,
    }
  )
}

/** Check if there is a valid keys from a list of Locks */
export const useValidKeyBulk = (locks: PaywallLocksConfigType) => {
  const { account } = useAuth()

  const web3Service = useWeb3Service()

  return useQueries({
    queries: Object.keys(locks).map((lockAddress) => {
      const network = locks[lockAddress].network
      return {
        enabled: !!account,
        queryKey: ['validKeyForKey', lockAddress, account, network],
        queryFn: async () => {
          if (!account) {
            return false
          }
          return web3Service.getHasValidKey(lockAddress, account!, network!)
        },
      }
    }),
  })
}
