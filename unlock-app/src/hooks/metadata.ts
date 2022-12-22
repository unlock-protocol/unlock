import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { useStorageService } from '~/utils/withStorageService'

interface Options {
  lockAddress: string
  network: number
  keyId: string
}

export const useUpdateMetadata = ({
  lockAddress,
  network,
  keyId,
}: Partial<Options>) => {
  const storageService = useStorageService()
  const queryClient = useQueryClient()
  return useMutation(
    ['updateMetadata', network, lockAddress, keyId],
    async (metadata: Metadata): Promise<Partial<Metadata>> => {
      const token = await storageService.getAccessToken()
      const headers = storageService.genAuthorizationHeader(token || '')
      if (!(lockAddress && network)) {
        throw new Error('Missing lock address or network')
      }
      if (keyId) {
        const keyResponse = await storageService.locksmith.updateKeyMetadata(
          network,
          lockAddress,
          keyId,
          {
            metadata,
          },
          {
            headers,
          }
        )
        return keyResponse.data as Metadata
      } else {
        const lockResponse = await storageService.locksmith.updateLockMetadata(
          network,
          lockAddress,
          {
            metadata,
          },
          {
            headers,
          }
        )
        return lockResponse.data as Metadata
      }
    },
    {
      onError: (error: Error) => {
        console.error(error)
        ToastHelper.error('Metadata update failed')
      },
      onSuccess: () => {
        ToastHelper.success('Metadata updated')
        queryClient.invalidateQueries({
          queryKey: ['metadata', lockAddress],
        })
      },
    }
  )
}

export const useMetadata = ({
  lockAddress,
  network,
  keyId,
}: Partial<Options>) => {
  const storageService = useStorageService()
  return useQuery(
    ['metadata', network, lockAddress, keyId],
    async (): Promise<Partial<Metadata>> => {
      try {
        if (keyId) {
          const keyResponse = await storageService.locksmith.keyMetadata(
            network!,
            lockAddress!,
            keyId
          )
          return keyResponse.data as Metadata
        } else {
          const lockResponse = await storageService.locksmith.lockMetadata(
            network!,
            lockAddress!
          )
          return lockResponse.data as Metadata
        }
      } catch (error) {
        return {} as Metadata
      }
    },
    {
      enabled: !!lockAddress && !!network,
    }
  )
}
