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
    const gasRefund = Number(
      await web3Service.getGasRefundValue({
        lockAddress,
        network,
      })
    )

    const isERC20 =
      lock?.currencyContractAddress &&
      lock.currencyContractAddress !== ethers.constants.AddressZero.toString()

    // TODO: Add gas refund
    const isRecurringPossible =
      lock?.expirationDuration != -1 &&
      lock?.publicLockVersion >= 10 &&
      isERC20 &&
      gasRefund > 0

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

export function useGetLockSettings({
  lockAddress,
  network,
}: LockSettingsProps) {
  return useQuery(['getLockSettings', lockAddress, network], async () => {
    const response = await storage.getLockSettings(network, lockAddress)
    return response?.data
  })
}

interface SaveLockProps {
  lockAddress: string
  network: number
  sendEmail?: boolean
  slug?: string
  replyTo?: string | null
  creditCardPrice?: number | null
  emailSender?: string | null
  checkoutConfigId?: string | null
  hookGuildId?: string | null
}

interface SaveLockProps {
  lockAddress: string
  network: number
  sendEmail?: boolean
  slug?: string
  replyTo?: string | null
  creditCardPrice?: number | null
  emailSender?: string | null
  checkoutConfigId?: string | null
  hookGuildId?: string | null
  unlockFeeChargedToUser?: boolean
  creditCardCurrency?: string
}

export function useSaveLockSettings() {
  return useMutation(async (config: SaveLockProps) => {
    const { lockAddress, network } = config
    return storage.saveLockSetting(network, lockAddress, {
      ...config,
    })
  })
}
