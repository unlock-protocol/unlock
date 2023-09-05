import { useMutation } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface Options {
  lockAddress: string
  network: number
  content: string
  subject: string
}

export const useCustomEmailSend = () => {
  const mutation = useMutation(
    async ({ network, lockAddress, content, subject }: Options) => {
      const response = await storage.sendCustomEmail(network, lockAddress, {
        content,
        subject,
      })
      return response.data.sent
    }
  )
  return mutation
}
