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

export const useMetadata = ({
  lockAddress,
  network,
  keyId,
}: Partial<Options>) => {
  return useQuery(
    ['metadata', network, lockAddress, keyId],
    async (): Promise<Partial<Metadata>> => {
      try {
        if (keyId) {
          // const keyResponse = await storage.keyMetadata(
          //   network!,
          //   lockAddress!,
          //   keyId
          // )
          // return keyResponse.data as Metadata
          return {
            name: 'Unlock Key',
            description:
              'A Key to an Unlock lock. Unlock is a protocol for memberships. https://unlock-protocol.com/',
            image:
              'http://localhost:8080/lock/0xd9C2A39DE41b1a16AF18317e4bA64bdf9ea44d18/icon?id=2',
            expiration: 1681539669,
            tokenId: '2',
            owner: '0x81dd955d02d337db81ba6c9c5f6213e647672052',
            minted: 1681239669,
            attributes: [
              {
                trait_type: 'Expiration',
                display_type: 'date',
                value: 1681539669,
              },
              {
                trait_type: 'Minted',
                display_type: 'date',
                value: 1681239669,
              },
            ],
            keyId: '2',
            lockAddress: '0xd9C2A39DE41b1a16AF18317e4bA64bdf9ea44d18',
            network: 80001,
          }
        } else {
          const lockResponse = await storage.lockMetadata(
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
