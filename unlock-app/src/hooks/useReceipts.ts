import { useMutation, useQuery } from '@tanstack/react-query'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import { storage } from '~/config/storage'

interface ReceiptProps {
  network: number
  lockAddress: string
  hash: string
}

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

      const hashes = key?.transactionsHash || []

      hashes.map((hash: string) => {
        url.searchParams.append('hash', hash)
      })

      return url.toString()
    }
  )
}

export const useGetReceipt = ({ lockAddress, network, hash }: ReceiptProps) => {
  return useQuery(
    ['getReceiptsDetails', network, lockAddress, hash],
    async (): Promise<any> => {
      try {
        const receiptResponse = await storage.getReceipt(
          network,
          ethers.utils.getAddress(lockAddress),
          hash
        )
        return receiptResponse.data
      } catch (error) {
        return {} as any
      }
    },
    {
      enabled: !!lockAddress && !!network,
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
      // convert basis points to percentage
      const vatRatePercentage: number | null =
        (supplier?.data?.vatBasisPointsRate ?? 0) / 100 || null

      return {
        ...supplier.data,
        vatRatePercentage,
      }
    },
    {
      enabled: !!lockAddress && !!network && isManager,
    }
  )
}

export const useUpdateReceipt = ({
  lockAddress,
  network,
  hash,
}: ReceiptProps) => {
  return useMutation(
    ['updateReceipt', lockAddress, network, hash],
    async (purchaser: any) => {
      try {
        const receiptResponse = await storage.saveReceipt(
          network,
          ethers.utils.getAddress(lockAddress),
          hash,
          {
            data: {
              ...purchaser,
            },
          }
        )
        return receiptResponse.data
      } catch (error) {
        return {} as any
      }
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
        // convert percentage to basis points
        const vatBasisPointsRate = supplier?.vatRatePercentage
          ? supplier?.vatRatePercentage * 100
          : null

        const supplierResponse = await storage.saveReceiptsBase(
          network,
          lockAddress,
          {
            data: {
              ...supplier,
              vatBasisPointsRate,
            },
          }
        )
        return supplierResponse.data
      }
      return Promise<null>
    }
  )
}
