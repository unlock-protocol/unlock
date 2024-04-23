import { useMutation } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface Options {
  recipients: string[]
  slug: string
}

export const useSendInvites = () => {
  const mutation = useMutation(async ({ slug, recipients }: Options) => {
    const response = await storage.sendEventInvites(slug, {
      recipients,
    })
    return response.data.sent
  })
  return mutation
}
