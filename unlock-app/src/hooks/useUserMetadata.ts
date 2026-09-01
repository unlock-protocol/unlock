import { useMutation, useQuery } from '@tanstack/react-query'
import { config } from '~/config/app'
import { locksmith, locksmithClient } from '~/config/locksmith'

interface User {
  userAddress: string
  network: number
  lockAddress: string
  metadata: Record<string, unknown>
}

interface UserMetadataQuery extends Omit<User, 'metadata'> {
  enabled?: boolean
  viewerAddress?: string
}

export const useUserMetadata = ({
  network,
  lockAddress,
  userAddress,
  enabled = true,
  viewerAddress,
}: UserMetadataQuery) => {
  return useQuery({
    queryKey: [
      'userMetadata',
      network,
      lockAddress,
      userAddress,
      viewerAddress,
    ],
    queryFn: async () => {
      const url = new URL(
        `/v2/api/metadata/${network}/locks/${lockAddress}/users/${userAddress}`,
        config.locksmithHost
      )
      const response = await locksmithClient.get(url.toString())
      return response.data
    },
    enabled: enabled && !!network && !!lockAddress && !!userAddress,
    retry: false,
  })
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
