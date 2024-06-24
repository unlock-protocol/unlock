import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

interface User {
  userAddress: string
  network: number
  lockAddress: string
  metadata: Record<string, any>
}

export const useUpdateUsersMetadata = () => {
  return useMutation(['updateUserMetadata'], async (users: User[]) => {
    const response = await locksmith.updateUsersMetadata({
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
      const response = await locksmith.updateUserMetadata(
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
