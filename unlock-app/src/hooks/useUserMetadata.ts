import { useMutation, useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

interface User {
  userAddress: string
  network: number
  lockAddress: string
  metadata: Record<string, unknown>
}

export const useUpdateUsersMetadata = () => {
  return useMutation({
    mutationKey: ['updateUserMetadata'],
    mutationFn: async (users: User[]) => {
      const response = await locksmith.updateUsersMetadata({
        users,
      })
      return response.data
    },
  })
}

export const useReadUserMetadata = ({
  network,
  lockAddress,
  userAddress,
  enabled = true,
}: Omit<User, 'metadata'> & { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['readUserMetadata', network, lockAddress, userAddress],
    queryFn: async () => {
      const response = await locksmith.getUserMetadata(
        network,
        lockAddress,
        userAddress
      )
      return response.data
    },
    enabled: enabled && !!network && !!lockAddress && !!userAddress,
  })
}

export const useUpdateUserMetadata = ({
  network,
  lockAddress,
  userAddress,
}: Omit<User, 'metadata'>) => {
  return useMutation({
    mutationKey: ['updateUserMetadata', network, lockAddress, userAddress],
    mutationFn: async (metadata: Record<string, unknown>) => {
      const response = await locksmith.updateUserMetadata(
        network,
        lockAddress,
        userAddress,
        {
          metadata,
        }
      )
      return response.data
    },
  })
}
