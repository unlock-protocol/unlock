import { useQuery } from '@tanstack/react-query'
import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'

export const useGetGasRefund = (lockAddress: string, network: number) => {
  return useQuery({
    queryKey: ['getGasRefund', lockAddress, network],
    queryFn: async () => {
      const web3Service = new Web3Service(networks)
      return web3Service.getGasRefundValue({
        lockAddress,
        network,
      })
    },
  })
}

export default useGetGasRefund
