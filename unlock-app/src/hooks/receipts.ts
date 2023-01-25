import { useMutation, useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'

interface GetReceiptProps {
  network: number
  lockAddress: string
  isManager: boolean
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
            ...supplier,
          }
        )
        return supplierResponse.data
      }
      return Promise<null>
    }
  )
}
