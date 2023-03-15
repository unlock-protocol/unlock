import { useWeb3Service } from '~/utils/withWeb3Service'

interface LockSettingsProps {
  lockAddress: string
  network: number
}

export function useLockSettings() {
  const web3Service = useWeb3Service()

  const getIsRecurringPossible = async ({
    lockAddress,
    network,
  }: LockSettingsProps) => {
    const lock = await web3Service.getLock(lockAddress, network)
    const refund = await await web3Service.refundPenaltyBasisPoints({
      lockAddress,
      network,
    })
    const isRecurringPossible =
      lock?.expirationDuration != -1 &&
      lock?.publicLockVersion >= 10 &&
      lock?.currencyContractAddress?.length > 0 &&
      refund > 0

    return {
      refund,
      isRecurringPossible,
    }
  }

  return {
    getIsRecurringPossible,
  }
}
