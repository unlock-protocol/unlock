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
