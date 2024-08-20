import { useMutation, useQuery } from '@tanstack/react-query'
import { PaywallConfigType } from '@unlock-protocol/core'
import { locksmith } from '~/config/locksmith'
import { useAuth } from '~/contexts/AuthenticationContext'

interface CheckoutConfigOptions {
  id?: string
}

export const useCheckoutConfig = ({ id }: CheckoutConfigOptions) => {
  return useQuery(
    ['checkoutConfigsById', id],
    async () => {
      try {
        const response = await locksmith.getCheckoutConfig(id!)
        return response.data
      } catch {
        return null
      }
    },
    {
      enabled: !!id,
      staleTime: 1000 * 60 * 60 * 1,
      refetchInterval: false,
    }
  )
}

export const useCheckoutConfigsByUserAndLock = ({
  lockAddress,
}: {
  lockAddress: string
}) => {
  const { account } = useAuth()
  return useQuery(
    ['checkoutConfigsByUser', account!],
    async () => {
      const response = await locksmith.listCheckoutConfigs()
      const locks = response.data.results?.filter((config) => {
        const configLocks = Object.keys(config.config.locks || {}).map(
          (lockAddress: string) => lockAddress.toLowerCase()
        )
        return configLocks.includes(lockAddress.toLowerCase())
      })

      return locks
    },
    { enabled: !!account }
  )
}

export const useCheckoutConfigsByUser = () => {
  const { account } = useAuth()
  return useQuery(['checkoutConfigsByUser', account!], async () => {
    const response = await locksmith.listCheckoutConfigs()
    return response.data.results
  })
}

interface UpdateOptions {
  name: string
  config: PaywallConfigType
  id?: string | null
}

export const useCheckoutConfigUpdate = () => {
  return useMutation(async ({ name, config, id }: UpdateOptions) => {
    const response = await locksmith.updateCheckoutConfig(id || '', {
      config,
      name,
    })

    return response.data
  })
}

export const useCheckoutConfigRemove = () => {
  return useMutation(async (id: string) => {
    const response = await locksmith.deleteCheckoutConfig(id)
    return response.data
  })
}
