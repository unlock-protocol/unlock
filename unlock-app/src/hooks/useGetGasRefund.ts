import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'

export const useGetGasRefund = (lockAddress: string, network: number) => {
  const web3Service = useWeb3Service()

  return useQuery({
    queryKey: ['getGasRefund', lockAddress, network],
    queryFn: async () => {
      return web3Service.getGasRefundValue({
        lockAddress,
        network,
      })
    },
  })
}

export default useGetGasRefund
