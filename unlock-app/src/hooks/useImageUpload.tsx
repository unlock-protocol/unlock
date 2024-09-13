import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

export const useImageUpload = () => {
  const mutation = useMutation({
    mutationKey: ['upload'],
    mutationFn: async (file: File) => {
      const response = await locksmith.uploadImages([file])
      const images = response.data.results?.map((item) => {
        return {
          url: item.url,
          name: item.originamName,
          publicUrl: item.publicUrl,
          metadata: item.metadata,
          type: item.mimetype,
        } as const
      })
      return images
    },
  })
  return mutation
}
