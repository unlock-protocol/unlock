import { useMutation, useQuery } from '@tanstack/react-query'
import { PaywallConfigType } from '@unlock-protocol/core'
import { locksmith } from '~/config/locksmith'
import { useAuthenticate } from './useAuthenticate'

interface CheckoutConfigOptions {
  id?: string
}

export const useCheckoutConfig = ({ id }: CheckoutConfigOptions) => {
  return useQuery({
    queryKey: ['checkoutConfigsById', id],
    queryFn: async () => {
      try {
        const response = await locksmith.getCheckoutConfig(id!)
        return response.data
      } catch {
        return null
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 1,
    refetchInterval: false,
  })
}

export const useCheckoutConfigsByUserAndLock = ({
  lockAddress,
}: {
  lockAddress: string
}) => {
  const { account } = useAuthenticate()
  return useQuery({
    queryKey: ['checkoutConfigsByUserAndLock', account!, lockAddress],
    queryFn: async () => {
      const response = await locksmith.listCheckoutConfigs()
      const locks = response.data.results?.filter((config) => {
        const configLocks = Object.keys(config.config.locks || {}).map(
          (lockAddress: string) => lockAddress.toLowerCase()
        )
        return configLocks.includes(lockAddress.toLowerCase())
      })

      return locks
    },
    enabled: !!account,
  })
}

export const useCheckoutConfigsByUser = () => {
  const { account } = useAuthenticate()
  return useQuery({
    queryKey: ['checkoutConfigsByUser', account!],
    queryFn: async () => {
      const response = await locksmith.listCheckoutConfigs()
      return response.data.results
    },
  })
}

interface UpdateOptions {
  name: string
  config: PaywallConfigType
  id?: string | null
}

export const useCheckoutConfigUpdate = () => {
  return useMutation({
    mutationFn: async ({ name, config, id }: UpdateOptions) => {
      const response = await locksmith.updateCheckoutConfig(id || '', {
        config,
        name,
      })
      return response.data
    },
  })
}

export const useCheckoutConfigRemove = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await locksmith.deleteCheckoutConfig(id)
      return response.data
    },
  })
}
