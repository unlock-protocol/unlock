import { useMutation, useQuery } from '@tanstack/react-query'
import { PaywallConfigType } from '@unlock-protocol/core'
import { storage } from '~/config/storage'
import { useAuth } from '~/contexts/AuthenticationContext'

interface CheckoutConfigOptions {
  id?: string
}

export const useCheckoutConfig = ({ id }: CheckoutConfigOptions) => {
  return useQuery(
    ['checkoutConfigsById', id],
    async () => {
      try {
        const response = await storage.getCheckoutConfig(id!)
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

export const useCheckoutConfigsByUser = () => {
  const { account } = useAuth()
  return useQuery(['checkoutConfigsByUser', account!], async () => {
    const response = await storage.listCheckoutConfigs()
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
    const response = await storage.updateCheckoutConfig(id || '', {
      config,
      name,
    })
    return response.data
  })
}

export const useCheckoutConfigRemove = () => {
  return useMutation(async (id: string) => {
    const response = await storage.deleteCheckoutConfig(id)
    return response.data
  })
}
