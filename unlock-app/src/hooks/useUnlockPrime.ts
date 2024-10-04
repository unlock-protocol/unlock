import { useQuery } from '@tanstack/react-query'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { useAuth } from '~/contexts/AuthenticationContext'

export const PRIME = '0x01D8412eE898A74cE44187F4877Bf9303E3C16e5'

// This hook will return the status of the user's prime key
export const useUnlockPrime = () => {
  const { account } = useAuth()
  console.log(account)

  const { data: isPrime, ...rest } = useQuery({
    queryKey: ['usePrime', account],
    queryFn: async () => {
      const web3Service = new Web3Service(networks)
      return web3Service.getHasValidKey(PRIME, account!, 8453)
    },
    enabled: !!account,
  })

  return { isPrime, ...rest }
}
