import { networks } from '@unlock-protocol/networks'
import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Unlock } from '@unlock-protocol/contracts'

export const useProtocolFee = (network: number) => {
  const web3Service = useWeb3Service()

  return useQuery({
    queryKey: ['protocolFee', network],
    queryFn: async () => {
      const provider = web3Service.providerForNetwork(network)
      const unlock = new ethers.Contract(
        networks[network].unlockAddress,
        Unlock.abi,
        provider
      )
      return Number(await unlock.protocolFee()) / 100
    },
  })
}
