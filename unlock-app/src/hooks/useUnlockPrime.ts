import { useQuery } from '@tanstack/react-query'
import networks from '@unlock-protocol/networks'
import Paywall from '@unlock-protocol/paywall'
import { useCallback } from 'react'
import { config } from '~/config/app'
import { getEventOrganizers } from './useEventOrganizers'
import { PaywallConfigType } from '@unlock-protocol/core'
import { useAuthenticate } from './useAuthenticate'
import { useWeb3Service } from '~/utils/withWeb3Service'

// This hook will return the status of the user's prime key
export const useUnlockPrime = () => {
  const { account } = useAuthenticate()
  const web3Service = useWeb3Service()
  const { data: isPrime, ...rest } = useQuery({
    queryKey: ['usePrime', account],
    queryFn: async () => {
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

// this hook will be used to return the "prime" status of an event, based on whether one of its organizers has prime.
export const useUnlockPrimeEvent = ({
  checkoutConfig,
}: {
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}) => {
  const web3Service = useWeb3Service()
  const { data: isPrime, ...rest } = useQuery({
    queryKey: ['usePrimeEvent', JSON.stringify(checkoutConfig)],
    queryFn: async () => {
      const organizers = await getEventOrganizers(checkoutConfig)
      const arePrime = await Promise.all(
        organizers.map(async (organizer) =>
          web3Service.getHasValidKey(
            config.prime.contract,
            organizer,
            config.prime.network
          )
        )
      )
      return arePrime.some((isPrime) => isPrime)
    },
  })
  return { isPrime, ...rest }
}
