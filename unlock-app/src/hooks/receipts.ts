import { useMutation, useQuery } from '@tanstack/react-query'
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
      return supplier.data
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
