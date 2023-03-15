import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface LockSettingsProps {
  lockAddress: string
  network: number
}

/** Hooks for Lock settings functions */
export const useGetRefundPenaltyBasisPoints = ({
  lockAddress,
  network,
}: LockSettingsProps) => {
  const web3Service = useWeb3Service()
  const { isLoading: isLoadingRefund, data: refund = 0 } = useQuery(
    ['getRefundPenaltyBasisPoints', lockAddress, network],
    async () => {
      return await await web3Service.refundPenaltyBasisPoints({
        lockAddress,
        network,
      })
    }
  )

  return {
    isLoadingRefund,
    refund,
  }
}
export function useLockSettings({ lockAddress, network }: LockSettingsProps) {
  const { refund, isLoadingRefund } = useGetRefundPenaltyBasisPoints({
    lockAddress,
    network,
  })

  const isRecurringPossible = (lock: any): boolean => {
    return (
      lock?.expirationDuration != -1 &&
      lock?.publicLockVersion >= 10 &&
      lock?.currencyContractAddress?.length > 0 &&
      refund > 0
    )
  }

  return {
    isLoadingRefund,
    isRecurringPossible,
    refund,
  }
}
