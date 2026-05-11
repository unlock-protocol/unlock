import { useMutation, useQuery } from '@tanstack/react-query'
import { config } from '~/config/app'
import { locksmith, locksmithClient } from '~/config/locksmith'

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

interface UserMetadataResponse {
  metadata: {
    public?: Record<string, string>
    protected?: Record<string, string>
  }
}

export const useUserMetadata = ({
  network,
  lockAddress,
  userAddress,
}: Partial<Omit<User, 'metadata'>>) => {
  return useQuery({
    queryKey: ['userMetadata', network, lockAddress, userAddress],
    queryFn: async () => {
      try {
        const response = await locksmithClient.get<UserMetadataResponse>(
          `${config.locksmithHost}/v2/api/metadata/${network}/locks/${lockAddress}/users/${userAddress}`
        )
        return response.data.metadata || {}
      } catch {
        return {}
      }
    },
    enabled: !!network && !!lockAddress && !!userAddress,
    retry: false,
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
