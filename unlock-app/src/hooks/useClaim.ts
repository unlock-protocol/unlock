import { useMutation } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface ClaimOption {
  data?: string
  captcha: string
}

interface Options {
  lockAddress: string
  network: number
}
export const useClaim = ({ lockAddress, network }: Options) => {
  return useMutation(
    ['claim', network, lockAddress],
    async ({ data, captcha }: ClaimOption) => {
      const response = await storage.claim(network, lockAddress, captcha, {
        data,
      })
      return response.data.transactionHash
    },
    {
      retry: 2,
    }
  )
}
