import { useMutation, useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { storage } from '~/config/storage'

interface ReceiptProps {
  network: number
  lockAddress: string
  hash: string
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
