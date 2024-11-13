import { useWeb3Service } from '~/utils/withWeb3Service'

export const useKeychain = ({
  lockAddress,
  network,
  owner,
  tokenAddress,
  keyId,
}: {
  lockAddress: string
  network: number
  owner: string
  tokenAddress: string
  keyId: string
}) => {
  const web3Service = useWeb3Service()

  const getCancellationFee = async () => {
    return web3Service.transferFeeBasisPoints(lockAddress, network)
  }

  const getLockBalance = async () => {
    return web3Service.getAddressBalance(lockAddress, network)
  }

  const getRefundAmount = async () => {
    return web3Service.getCancelAndRefundValueFor(
      {
        lockAddress,
        owner,
        tokenAddress,
        network,
        tokenId: keyId,
      },
      {} /** transactionParams */,
      () => true
    )
  }

  const getAmounts = async (): Promise<{
    refundAmount: number
    transferFee: number
    lockBalance: number
  }> => {
    const refundAmount = await getRefundAmount()
    const transferFee = await getCancellationFee()
    const lockBalance = parseFloat(await getLockBalance())

    return {
      refundAmount,
      transferFee,
      lockBalance,
    }
  }

  return {
    getAmounts,
  }
}
