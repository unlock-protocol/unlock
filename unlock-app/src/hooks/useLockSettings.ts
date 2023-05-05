import { useQuery, useMutation } from '@tanstack/react-query'
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

export function useGetLockSettingsBySlug(slug = '') {
  return useQuery(['getLockSettingsBySlug', slug], async () => {
    if (slug) {
      return (await storage.getLockSettingsBySlug(slug)).data
    }
    return null
  })
}

interface SaveSlugProps {
  slug: string
  lockAddress: string
  network: number
}

interface SettingsProps {
  lockAddress: string
  network: number
  slug?: string
  creditCardPrice?: number | null
}

export function useSaveSlugSetting() {
  return useMutation(async ({ slug, lockAddress, network }: SaveSlugProps) => {
    if (slug) {
      return storage.saveLockSetting(network, lockAddress, {
        slug,
      })
    }
  })
}

export function useSaveLockSettings() {
  return useMutation(async (settings: SettingsProps) => {
    const { lockAddress, network } = settings

    return storage.saveLockSetting(network, lockAddress, {
      ...settings,
    })
  })
}

export function useGetLockSettings({
  lockAddress,
  network,
}: {
  lockAddress: string
  network: number
}) {
  return useQuery(['getLockSetting', lockAddress, network], async () => {
    return await storage.getLockSettings(network, lockAddress)
  })
}
