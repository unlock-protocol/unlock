import { useQuery } from '@tanstack/react-query'
import networks from '@unlock-protocol/networks'
import Paywall from '@unlock-protocol/paywall'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { useCallback } from 'react'
import { config } from '~/config/app'
import { useAuth } from '~/contexts/AuthenticationContext'

// This hook will return the status of the user's prime key
export const useUnlockPrime = () => {
  const { account } = useAuth()

  const { data: isPrime, ...rest } = useQuery({
    queryKey: ['usePrime', account],
    queryFn: async () => {
      const web3Service = new Web3Service(networks)
      return web3Service.getHasValidKey(
        config.prime.contract,
        account!,
        config.prime.network
      )
    },
    enabled: !!account,
  })

  const joinPrime = useCallback(async () => {
    const paywall = new Paywall(networks)
    await paywall.loadCheckoutModal({
      title: '🪄 Join Unlock Prime!',
      locks: {
        [config.prime.contract]: {
          network: config.prime.network,
          skipRecipient: true,
          recurringPayments: 'forever',
        },
      },
      skipRecipient: true,
      pessimistic: true,
    })
    rest.refetch() // Refetch, in case there was a purchase!
  }, [])

  return { isPrime, ...rest, joinPrime }
}
