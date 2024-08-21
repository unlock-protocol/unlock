import { useMutation, useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

interface Options {
  lockAddress: string
  network: number
  backTo?: string
}

interface useStripeConnectMutationArgs {
  stripeAccount?: string
}

export const useStripeConnect = ({ lockAddress, network, backTo }: Options) => {
  return useMutation({
    mutationKey: ['stripeConnect', network, lockAddress, backTo],
    mutationFn: async ({ stripeAccount }: useStripeConnectMutationArgs) => {
      const response = await locksmith.connectStripeAccount(
        network,
        lockAddress,
        {
          baseUrl: backTo || window.location.origin,
          stripeAccount,
        }
      )
      return response?.data
    },
    retry: 2,
  })
}

export const useStripeDisconnect = ({ lockAddress, network }: Options) => {
  return useMutation({
    mutationKey: ['stripeDisconnect', network, lockAddress],
    mutationFn: async () => {
      const response = await locksmith.disconnectStripe(network, lockAddress)
      return response.data
    },
    retry: 2,
  })
}

export const useGetLockStripeConnectionDetails = ({
  lockAddress,
  network,
}: Options) => {
  return useQuery({
    queryKey: ['getLockStripeConnectionDetails', lockAddress, network],
    queryFn: async () => {
      const response = await locksmith.getLockStripeConnectionDetails(
        lockAddress,
        network
      )
      return response.data ?? {}
    },
  })
}
