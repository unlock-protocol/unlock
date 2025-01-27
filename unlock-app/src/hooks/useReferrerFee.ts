import { useMutation, useQuery } from '@tanstack/react-query'
import { useProvider } from './useProvider'
import { graphService } from '~/config/subgraph'

interface ReferrerFeeProps {
  lockAddress: string
  network: number
}

interface SetReferrerParams {
  referralFeePercentage: number
  referralAddress: string
}

export const useReferrerFee = ({ lockAddress, network }: ReferrerFeeProps) => {
  const { getWalletService } = useProvider()

  const setReferrerFeeForLock = async (params: SetReferrerParams) => {
    const walletService = await getWalletService(network)
    await walletService.setReferrerFee({
      lockAddress,
      address: params.referralAddress,
      feeBasisPoint: params.referralFeePercentage * 100,
    })
  }

  const setReferrerFee = useMutation({
    mutationFn: setReferrerFeeForLock,
  })

  const isSettingReferrerFee = setReferrerFee.isPending

  const getLock = async () => {
    return graphService.lock(
      {
        where: {
          address: lockAddress,
        },
      },
      {
        network,
      }
    )
  }

  const {
    isPending,
    data: referralFeesData,
    error,
    refetch,
  } = useQuery({
    queryKey: ['getLock', lockAddress, network, setReferrerFee.isSuccess],
    queryFn: getLock,
  })

  const data = (referralFeesData?.referrerFees || []).filter(
    (referralFeesData) => referralFeesData.fee > 0
  )

  return {
    isLoading: isPending,
    data,
    setReferrerFee,
    isSettingReferrerFee,
    error,
    refetch,
  }
}
