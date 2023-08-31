import { useMutation } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface Options {
  lockAddress: string
  network: number
}

export const useEmailListUnSubscribe = ({ lockAddress, network }: Options) => {
  const mutation = useMutation(
    ['unsubscribe', lockAddress, network],
    async () => {
      const response = await storage.unsubscribeEmail(network, lockAddress)
      return response.data.success
    }
  )
  return mutation
}

export const useEmailListReSubscribe = ({ lockAddress, network }: Options) => {
  const mutation = useMutation(
    ['resubscribe', lockAddress, network],
    async () => {
      const response = await storage.reSubscribeEmail(network, lockAddress)
      return response.data.success
    }
  )
  return mutation
}
