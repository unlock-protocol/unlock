import { useMutation, useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { locksmith } from '~/config/locksmith'
import { graphService } from '~/config/subgraph'

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

type Job = {
  id: string
  payload: {
    status: 'pending' | 'success'
    key: string
    result: string[]
  }
  createdAt: string
  updatedAt: string
}

export const useGetReceiptsPageUrl = ({
  network,
  lockAddress,
  tokenId,
}: ReceiptsUrlProps) => {
  return useQuery({
    queryKey: ['getReceiptsPageUrl', lockAddress, network, tokenId],
    queryFn: async () => {
      const key = await graphService.key(
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
    },
  })
}

export const useGetReceipt = ({ lockAddress, network, hash }: ReceiptProps) => {
  return useQuery({
    queryKey: ['getReceiptsDetails', network, lockAddress, hash],
    queryFn: async (): Promise<any> => {
      try {
        const receiptResponse = await locksmith.getReceipt(
          network,
          ethers.getAddress(lockAddress),
          hash
        )
        return receiptResponse.data
      } catch (error) {
        return {} as any
      }
    },
    enabled: !!lockAddress && !!network,
  })
}

export const useGetReceiptsBase = ({
  network,
  lockAddress,
  isManager,
}: GetReceiptProps) => {
  return useQuery({
    queryKey: ['getReceiptsBase', network, lockAddress],
    queryFn: async (): Promise<Partial<any>> => {
      const supplier = await locksmith.getReceiptsBase(network, lockAddress)
      // convert basis points to percentage
      const vatRatePercentage: number | null =
        (supplier?.data?.vatBasisPointsRate ?? 0) / 100 || null

      return {
        ...supplier.data,
        vatRatePercentage,
      }
    },
    enabled: !!lockAddress && !!network && isManager,
  })
}

export const useUpdateReceipt = ({
  lockAddress,
  network,
  hash,
}: ReceiptProps) => {
  return useMutation({
    mutationKey: ['updateReceipt', lockAddress, network, hash],
    mutationFn: async (purchaser: any) => {
      try {
        const receiptResponse = await locksmith.saveReceipt(
          network,
          ethers.getAddress(lockAddress),
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
    },
  })
}
export const useUpdateReceiptsBase = ({
  network,
  lockAddress,
  isManager,
}: GetReceiptProps) => {
  return useMutation({
    mutationKey: ['saveReceiptsBase', network, lockAddress],
    mutationFn: async (supplier: any) => {
      if (!isManager) {
        throw new Error('Not authorized to update receipts base')
      }

      // convert percentage to basis points
      const vatBasisPointsRate = supplier?.vatRatePercentage
        ? supplier.vatRatePercentage * 100
        : null

      const supplierResponse = await locksmith.saveReceiptsBase(
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
    },
  })
}

const fetchReceiptsStatus = async ({ queryKey }: any) => {
  const [, network, lockAddress] = queryKey
  const { data } = await locksmith.getReceiptsStatus(network, lockAddress)
  return data
}

export const useReceiptsStatus = (
  network: number,
  lockAddress: string,
  condition = true
) => {
  const [timeoutReached, setTimeoutReached] = useState(false)
  const timeout = 5 * 60 * 1000
  const refetchInterval = 3000

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (condition) {
      timer = setTimeout(() => {
        setTimeoutReached(true)
      }, timeout)
    }

    return () => timer && clearTimeout(timer)
  }, [condition])

  return useQuery<Job | any>({
    queryKey: ['receiptsStatus', network, lockAddress],
    queryFn: fetchReceiptsStatus,
    enabled: !timeoutReached,
    refetchInterval: condition && !timeoutReached ? refetchInterval : false,
  })
}
