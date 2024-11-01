import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useProvider } from './useProvider'

interface TransferFeeProps {
  lockAddress: string
  network: number
}

const getTransferFeeBasisPoints = async (
  lockAddress: string,
  network: number,
  web3Service: any
) => {
  return await web3Service.transferFeeBasisPoints(lockAddress, network)
}

export const useTransferFee = ({ lockAddress, network }: TransferFeeProps) => {
  const { getWalletService } = useProvider()
  const web3Service = useWeb3Service()

  const updateTransferFee = async (transferFeePercentage: number) => {
    if (!lockAddress) return

    const walletService = await getWalletService(network)
    await walletService.updateTransferFee({
      lockAddress,
      transferFeeBasisPoints: transferFeePercentage * 100, // convert to basis points
    })
  }

  return {
    updateTransferFee,
    getTransferFeeBasisPoints: () =>
      getTransferFeeBasisPoints(lockAddress, network, web3Service),
  }
}

export const useFetchTransferFee = ({
  lockAddress,
  network,
}: TransferFeeProps) => {
  const web3service = useWeb3Service()

  async function fetchTransferFees() {
    const result = await getTransferFeeBasisPoints(
      lockAddress,
      network,
      web3service
    )
    const transferFees = Number(result)
    return transferFees
  }

  const { isLoading, error, data } = useQuery({
    queryKey: ['transferFees', lockAddress, network],
    queryFn: fetchTransferFees,
  })

  return {
    isLoading,
    error,
    data,
  }
}
