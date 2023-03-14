import { useMutation } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface Options {
  lockAddress: string
  network: number
  backTo?: string
}

export const useStripeConnect = ({ lockAddress, network, backTo }: Options) => {
  return useMutation(
    ['stripeConnect', network, lockAddress, backTo],
    async () => {
      const response = await storage.connectStripeAccount(
        network,
        lockAddress,
        {
          baseUrl: backTo || window.location.origin,
        }
      )
      return response?.data
    },
    {
      retry: 2,
    }
  )
}

export const useStripeDisconnect = ({ lockAddress, network }: Options) => {
  return useMutation(
    ['stripeDisconnect', network, lockAddress],
    async () => {
      const response = await storage.disconnectStripe(network, lockAddress)
      return response.data
    },
    {
      retry: 2,
    }
  )
}
