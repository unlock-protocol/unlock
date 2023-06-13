import { useQuery } from '@tanstack/react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface TransferFeeProps {
  lockAddress: string
  network: number
}

export const useTransferFee = ({ lockAddress, network }: TransferFeeProps) => {
  const { getWalletService } = useAuth()
  const web3Service = useWeb3Service()

  const updateTransferFee = async (transferFeePercentage: number) => {
    if (!lockAddress) return

    const walletService = await getWalletService(network)
    await walletService.updateTransferFee({
      lockAddress,
      transferFeeBasisPoints: transferFeePercentage * 100, // convert to basis points
    })
  }

  const getTransferFeeBasisPoints = async () => {
    return await web3Service.transferFeeBasisPoints(lockAddress, network)
  }

  return {
    updateTransferFee,
    getTransferFeeBasisPoints,
  }
}

export const useGetTransferFeeBasisPoints = ({
  lockAddress,
  network,
}: TransferFeeProps) => {
  const web3Service = useWeb3Service()
  return useQuery(
    ['transferFeeBasisPoints', lockAddress, network],
    async () => {
      const transferFeeBasisPoints = await web3Service.transferFeeBasisPoints(
        lockAddress,
        network
      )
      const transferFeePercentage = (transferFeeBasisPoints ?? 0) / 100
      const isTransferAllowed = transferFeePercentage < 100

      return {
        transferFeePercentage,
        isTransferAllowed,
      }
    }
  )
}
