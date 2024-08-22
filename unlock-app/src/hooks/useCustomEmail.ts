import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

interface Options {
  lockAddress: string
  network: number
  content: string
  subject: string
}

export const useCustomEmailSend = () => {
  const mutation = useMutation({
    mutationFn: async ({ network, lockAddress, content, subject }: Options) => {
      const response = await locksmith.sendCustomEmail(network, lockAddress, {
        content,
        subject,
      })
      return response.data.sent
    },
  })
  return mutation
}
