import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

interface RsvpOption {
  data?: any
  email?: string
  captcha: string
  recipient?: string
}

interface Options {
  lockAddress: string
  network: number
}
export const useRsvp = ({ lockAddress, network }: Options) => {
  return useMutation(
    ['rsvp', network, lockAddress],
    async ({ data, recipient, captcha, email }: RsvpOption) => {
      try {
        const response = await locksmith.rsvp(network, lockAddress, captcha, {
          recipient,
          data,
          email,
        })
        return response.data
      } catch (error: any) {
        if (error.response.data?.message) {
          return error.response.data
        }
        throw error
      }
    },
    {
      retry: 2,
    }
  )
}
