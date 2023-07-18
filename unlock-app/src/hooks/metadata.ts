import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { storage } from '~/config/storage'

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
  const queryClient = useQueryClient()
  return useMutation(
    ['updateMetadata', network, lockAddress, keyId],
    async (metadata: Metadata): Promise<Partial<Metadata>> => {
      if (keyId) {
        const keyResponse = await storage.updateKeyMetadata(
          network!,
          lockAddress!,
          keyId,
          {
            metadata,
          }
        )
        return keyResponse.data as Metadata
      } else {
        const lockResponse = await storage.updateLockMetadata(
          network!,
          lockAddress!,
          {
            metadata,
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

export const getMetadata = async (
  lockAddress: string,
  network: number,
  keyId?: string
): Promise<Partial<Metadata>> => {
  try {
    if (keyId) {
      const keyResponse = await storage.keyMetadata(
        network!,
        lockAddress!,
        keyId
      )
      return keyResponse.data as Metadata
    } else {
      const lockResponse = await storage.lockMetadata(network!, lockAddress!)
      return lockResponse.data as Metadata
    }
  } catch (error) {
    return {} as Metadata
  }
}

export const useMetadata = ({
  lockAddress,
  network,
  keyId,
}: Partial<Options>) => {
  return useQuery(
    ['metadata', network, lockAddress, keyId],
    () => {
      if (lockAddress && network) {
        return getMetadata(lockAddress, network, keyId)
      }
      return {} as Metadata
    },
    {
      enabled: !!lockAddress && !!network,
    }
  )
}
