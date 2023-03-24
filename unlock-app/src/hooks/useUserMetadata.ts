import { useMutation } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface User {
  userAddress: string
  network: number
  lockAddress: string
  metadata: Record<string, any>
}

export const useUpdateUsersMetadata = () => {
  return useMutation(['updateUserMetadata'], async (users: User[]) => {
    const response = await storage.updateUsersMetadata({
      users,
    })
    return response.data
  })
}

export const useUpdateUserMetadata = ({
  network,
  lockAddress,
  userAddress,
}: Omit<User, 'metadata'>) => {
  return useMutation(
    ['updateUserMetadata', network, lockAddress, userAddress],
    async (metadata: Record<string, any>) => {
      const response = await storage.updateUserMetadata(
        network,
        lockAddress,
        userAddress,
        {
          metadata,
        }
      )
      return response.data
    }
  )
}
