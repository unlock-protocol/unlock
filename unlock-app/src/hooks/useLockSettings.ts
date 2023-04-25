import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { storage } from '~/config/storage'
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

    // TODO: Add gas refund
    const gasRefund = 0.1

    const isERC20 =
      lock?.currencyContractAddress &&
      lock.currencyContractAddress !== ethers.constants.AddressZero.toString()

    // TODO: Add gas refund
    const isRecurringPossible =
      lock?.expirationDuration != -1 && lock?.publicLockVersion >= 10 && isERC20

    // 1 year of recurring payments
    const oneYearRecurring = Math.floor(
      365 / Number(secondsAsDays(lock.expirationDuration))
    )

    return {
      isRecurringPossible,
      oneYearRecurring,
      gasRefund,
    }
  }

  return {
    getIsRecurringPossible,
  }
}

export function useGetLockSettingsBySlug(slug?: string) {
  return useQuery(['getLockSettingsBySlug', slug], async () => {
    if (slug) {
      return (await storage.getLockSettingsBySlug(slug)).data
    }
    return null
  })
}
