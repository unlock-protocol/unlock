import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/storage'

export const useImageUpload = () => {
  const mutation = useMutation(['upload'], async (file: File) => {
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
  })
  return mutation
}
