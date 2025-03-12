import { useQuery, useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { ADDRESS_ZERO } from '~/constants'
import { secondsAsDays } from '~/utils/durations'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useAuthenticate } from './useAuthenticate'

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
      lock.currencyContractAddress !== ADDRESS_ZERO

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
  return useQuery({
    queryKey: ['getLockSettingsBySlug', slug],
    queryFn: async () => {
      if (slug) {
        return (await locksmith.getLockSettingsBySlug(slug)).data
      }
      return null
    },
  })
}

export function useGetLockSettings({
  lockAddress,
  network,
}: LockSettingsProps) {
  const { account } = useAuthenticate()
  return useQuery({
    queryKey: ['getLockSettings', lockAddress, network, account],
    queryFn: async () => {
      const response = await locksmith.getLockSettings(network, lockAddress)
      return response?.data
    },
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
  unlockFeeChargedToUser?: boolean
  creditCardCurrency?: string
  promoCodes?: string[]
  crossmintClientId?: string
  requiredGitcoinPassportScore?: number | null
  passwords?: string[]
  allowList?: string[] | null
}

export function useSaveLockSettings() {
  return useMutation({
    mutationFn: async (config: SaveLockProps) => {
      const { lockAddress, network } = config
      return locksmith.saveLockSetting(network, lockAddress, {
        ...config,
      })
    },
  })
}
