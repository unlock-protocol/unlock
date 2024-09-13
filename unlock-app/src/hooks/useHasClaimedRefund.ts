import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import KickbackAbi from '~/components/content/event/Settings/Components/Kickback/KickbackAbi'
import { config } from '~/config/app'
import { useWeb3Service } from '~/utils/withWeb3Service'

export const useHasClaimedRefund = (
  lockAddress: string,
  network: number,
  account: string | undefined
) => {
  const web3Service = useWeb3Service()
  const { kickbackAddress } = config.networks[network]
  const provider = web3Service.providerForNetwork(network)

  return useQuery({
    queryKey: ['hasClaimedRefund', account, lockAddress, network],
    queryFn: async () => {
      const contract = new ethers.Contract(
        kickbackAddress!,
        KickbackAbi,
        provider
      )
      const claimed = await contract.issuedRefunds(lockAddress, account)
      return !!claimed
    },
    enabled: !!account,
  })
}
