import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

interface Options {
  lockAddress: string
  network: number
}

export const useEmailListUnSubscribe = ({ lockAddress, network }: Options) => {
  const mutation = useMutation({
    mutationKey: ['unsubscribe', lockAddress, network],
    mutationFn: async () => {
      const response = await locksmith.unsubscribeEmail(network, lockAddress)
      return response.data.success
    },
  })
  return mutation
}

export const useEmailListReSubscribe = ({ lockAddress, network }: Options) => {
  const mutation = useMutation({
    mutationKey: ['resubscribe', lockAddress, network],
    mutationFn: async () => {
      const response = await locksmith.reSubscribeEmail(network, lockAddress)
      return response.data.success
    },
  })
  return mutation
}
