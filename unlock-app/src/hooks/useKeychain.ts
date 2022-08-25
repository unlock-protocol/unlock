import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { useQuery } from 'react-query'

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
  const web3Service = new Web3Service(networks)

  const getCancellationFee = async () => {
    return web3Service.transferFeeBasisPoints(lockAddress, network)
  }

  const getLockBalance = async () => {
    return web3Service.getAddressBalance(lockAddress, network)
  }

  const getRefundAmount = async () => {
    const params = {
      lockAddress,
      owner,
      tokenAddress,
      network,
      tokenId: keyId,
    }
    const web3Service = new Web3Service(networks)
    return web3Service.getCancelAndRefundValueFor(params)
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

  const { isLoading, data } = useQuery(
    ['getAmounts', lockAddress],
    () => getAmounts(),
    {
      refetchInterval: false,
    }
  )

  return {
    isLoading,
    data,
  }
}
