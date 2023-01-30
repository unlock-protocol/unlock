import { useMutation, useQuery } from '@tanstack/react-query'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { storage } from '~/config/storage'

interface GetReceiptProps {
  network: number
  lockAddress: string
  isManager: boolean
}

interface ReceiptsUrlProps {
  network: number
  lockAddress: string
  tokenId: string
}

export const useGetReceiptsPageUrl = ({
  network,
  lockAddress,
  tokenId,
}: ReceiptsUrlProps) => {
  return useQuery(
    ['getReceiptsPageUrl', lockAddress, network, tokenId],
    async () => {
      const subgraph = new SubgraphService()
      const key = await subgraph.key(
        {
          where: {
            id: `${lockAddress}-${tokenId}`,
            tokenId,
          },
        },
        {
          network,
        }
      )
      const url = new URL(`${window.location.origin}/receipts`)

      url.searchParams.append('address', lockAddress)
      url.searchParams.append('network', `${network}`)

      key.transactionsHash.map((hash: string) => {
        url.searchParams.append('hash', hash)
      })

      return url.toString()
    }
  )
}

export const useGetReceiptsBase = ({
  network,
  lockAddress,
  isManager,
}: GetReceiptProps) => {
  return useQuery(
    ['getReceiptsBase', network, lockAddress],
    async (): Promise<Partial<any>> => {
      const supplier = await storage.getReceiptsBase(network, lockAddress)
      return supplier.data
    },
    {
      enabled: !!lockAddress && !!network && isManager,
    }
  )
}

export const useUpdateReceiptsBase = ({
  network,
  lockAddress,
  isManager,
}: GetReceiptProps) => {
  return useMutation(
    ['saveReceiptsBase', network, lockAddress],
    async (supplier: any): Promise<Partial<any>> => {
      if (isManager) {
        const supplierResponse = await storage.saveReceiptsBase(
          network,
          lockAddress,
          {
            data: {
              ...supplier,
            },
          }
        )
        return supplierResponse.data
      }
      return Promise<null>
    }
  )
}
