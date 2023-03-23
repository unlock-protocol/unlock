import { ethers } from 'ethers'
import { secondsAsDays } from '~/utils/durations'
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

    const isERC20 =
      lock?.currencyContractAddress &&
      lock.currencyContractAddress !== ethers.constants.AddressZero.toString()

    // todo: Add gas refund
    const isRecurringPossible =
      lock?.expirationDuration != -1 && lock?.publicLockVersion >= 10 && isERC20

    // 1 year of recurring payments
    const oneYearRecurring = Math.floor(
      365 / Number(secondsAsDays(lock.expirationDuration))
    )

    return {
      isRecurringPossible,
      oneYearRecurring,
    }
  }

  return {
    getIsRecurringPossible,
  }
}
