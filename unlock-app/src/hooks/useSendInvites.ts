import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

interface Options {
  recipients: string[]
  slug: string
}

export const useSendInvites = () => {
  const mutation = useMutation({
    mutationFn: async ({ slug, recipients }: Options) => {
      const response = await locksmith.sendEventInvites(slug, {
        recipients,
      })
      return response.data.sent
    },
  })
  return mutation
}
