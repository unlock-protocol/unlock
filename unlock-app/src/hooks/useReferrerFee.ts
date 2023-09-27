import { useMutation, useQuery } from '@tanstack/react-query'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { useAuth } from '~/contexts/AuthenticationContext'

interface ReferrerFeeProps {
  lockAddress: string
  network: number
}

interface SetReferrerParams {
  referralFeePercentage: number
  referralAddress: string
}

export const useReferrerFee = ({ lockAddress, network }: ReferrerFeeProps) => {
  const { getWalletService } = useAuth()

  const setReferrerFeeForLock = async (params: SetReferrerParams) => {
    const walletService = await getWalletService(network)
    await walletService.setReferrerFee({
      lockAddress,
      address: params.referralAddress,
      feeBasisPoint: params.referralFeePercentage * 100,
    })
  }

  const setReferrerFee = useMutation(setReferrerFeeForLock)

  const isSettingReferrerFee = setReferrerFee.isLoading

  const getLock = async () => {
    const service = new SubgraphService()
    return service.lock(
      {
        where: {
          id: lockAddress,
        },
      },
      {
        network,
      }
    )
  }

  const {
    isLoading,
    data: referralFeesData,
    error,
    refetch,
  } = useQuery(
    ['getLock', lockAddress, network, setReferrerFee.isSuccess],
    async () => getLock()
  )

  const data = referralFeesData?.referrerFees || []

  return {
    isLoading,
    data,
    setReferrerFee,
    isSettingReferrerFee,
    error,
    refetch,
  }
}
