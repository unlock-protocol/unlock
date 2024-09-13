import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

interface ClaimOption {
  data?: string
  email?: string
  captcha: string
  recipient?: string
  metadata?: any
}

interface Options {
  lockAddress: string
  network: number
}

export const useClaim = ({ lockAddress, network }: Options) => {
  return useMutation({
    mutationKey: ['claim', network, lockAddress],
    mutationFn: async ({
      data,
      recipient,
      captcha,
      email,
      metadata,
    }: ClaimOption) => {
      try {
        const response = await locksmith.claim(network, lockAddress, captcha, {
          recipient,
          data,
          email,
          ...metadata,
        })
        return {
          hash: response.data.transactionHash,
          owner: response.data.owner,
        }
      } catch (error: any) {
        if (error.response?.data?.message) {
          return error.response.data
        }
        throw error
      }
    },
    retry: 2,
  })
}
