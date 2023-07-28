import { useMutation, useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface Options {
  lockAddress: string
  network: number
  backTo?: string
}

interface useStripeConnectMutationArgs {
  stripeAccount?: string
}

export const useStripeConnect = ({ lockAddress, network, backTo }: Options) => {
  return useMutation<any, any, useStripeConnectMutationArgs>(
    ['stripeConnect', network, lockAddress, backTo],
    async ({ stripeAccount }) => {
      const response = await storage.connectStripeAccount(
        network,
        lockAddress,
        {
          baseUrl: backTo || window.location.origin,
          stripeAccount,
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

export const useGetLockStripeConnectionDetails = ({
  lockAddress,
  network,
}: Options) => {
  return useQuery(
    ['getLockStripeConnectionDetails', lockAddress, network],
    async () => {
      const response = await storage.getLockStripeConnectionDetails(
        lockAddress,
        network
      )
      return response.data ?? {}
    }
  )
}
