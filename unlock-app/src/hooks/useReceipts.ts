import {
  QueryFunctionContext,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { config } from '~/config/app'
import { locksmith, locksmithClient } from '~/config/locksmith'
import { graphService } from '~/config/subgraph'

interface ReceiptProps {
  network: number
  lockAddress: string
  hash: string
}

interface EmailReceiptProps extends ReceiptProps {
  content: string
  subject: string
}

interface GetReceiptProps {
  network: number
  lockAddress: string
  isManager: boolean
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

export interface ReceiptWithDetails {
  receipt?: {
    id: string
  } | null
  [key: string]: unknown
}

type ReceiptDetails = Record<string, unknown>

interface ReceiptSupplierInput extends Record<string, unknown> {
  vatRatePercentage?: number | null
}

interface ReceiptsBaseData extends ReceiptSupplierInput {
  vatBasisPointsRate?: number | null
}

export const receiptsUrl = ({
  lockAddress,
  network,
  receipts,
}: {
  lockAddress: string
  network: number
  receipts: ReceiptWithDetails[]
}) => {
  const url = new URL(`${window.location.origin}/receipts`)

  url.searchParams.append('address', lockAddress)
  url.searchParams.append('network', `${network}`)
  if (receipts) {
    receipts.forEach(({ receipt }) => {
      if (!receipt?.id) {
        return
      }
      url.searchParams.append('hash', receipt.id)
    })
  }
  return url.toString()
}

export const useGetReceiptsForKey = ({
  lockAddress,
  network,
  tokenId,
}: {
  lockAddress: string
  network: number
  tokenId: string
}) => {
  return useQuery({
    queryKey: ['getReceiptsForKey', network, lockAddress, tokenId],
    queryFn: async (): Promise<ReceiptWithDetails[]> => {
      // First, get the hashes!
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

      const hashes = (key?.transactionsHash || []) as string[]

      // Ok, now we have the hashes, let's get the receipts
      const receipts = await Promise.all(
        hashes.map(async (hash) => {
          try {
            const { data } = await locksmith.getReceipt(
              network,
              ethers.getAddress(lockAddress),
              hash
            )
            return data.receipt ? data : null
          } catch (error) {
            return null
          }
        })
      )
      return receipts.filter(
        (receipt): receipt is ReceiptWithDetails => !!receipt
      )
    },
    enabled: !!lockAddress && !!network && !!tokenId,
  })
}

export const useGetReceipt = ({ lockAddress, network, hash }: ReceiptProps) => {
  return useQuery({
    queryKey: ['getReceiptsDetails', network, lockAddress, hash],
    queryFn: async (): Promise<ReceiptDetails> => {
      try {
        const receiptResponse = await locksmith.getReceipt(
          network,
          ethers.getAddress(lockAddress),
          hash
        )
        return receiptResponse.data
      } catch (error) {
        return {}
      }
    },
    enabled: !!lockAddress && !!network,
  })
}

export const useEmailReceipt = ({ lockAddress, network, hash }: ReceiptProps) =>
  useMutation({
    mutationFn: async ({
      content,
      subject,
    }: Pick<EmailReceiptProps, 'content' | 'subject'>) => {
      const response = await locksmithClient.post(
        `${config.locksmithHost}/v2/receipts/${network}/${ethers.getAddress(
          lockAddress
        )}/${hash}/email`,
        {
          content,
          subject,
        }
      )
      return response.data
    },
  })

export const useGetReceiptsBase = ({
  network,
  lockAddress,
  isManager,
}: GetReceiptProps) => {
  return useQuery({
    queryKey: ['getReceiptsBase', network, lockAddress],
    queryFn: async (): Promise<Partial<ReceiptsBaseData>> => {
      const supplier = await locksmith.getReceiptsBase(network, lockAddress)
      const supplierData = supplier.data as ReceiptsBaseData
      // convert basis points to percentage
      const vatRatePercentage: number | null =
        (supplierData?.vatBasisPointsRate ?? 0) / 100 || null

      return {
        ...supplierData,
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
    mutationFn: async (purchaser: Record<string, unknown>) => {
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
        return {}
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
    mutationFn: async (supplier: ReceiptSupplierInput) => {
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

const fetchReceiptsStatus = async ({
  queryKey,
}: QueryFunctionContext<readonly ['receiptsStatus', number, string]>) => {
  const [, network, lockAddress] = queryKey
  const { data } = await locksmith.getReceiptsStatus(network, lockAddress)
  return data
}

const RECEIPTS_STATUS_TIMEOUT = 5 * 60 * 1000
const RECEIPTS_STATUS_REFETCH_INTERVAL = 3000

export const useReceiptsStatus = (
  network: number,
  lockAddress: string,
  condition = true
) => {
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (condition) {
      timer = setTimeout(() => {
        setTimeoutReached(true)
      }, RECEIPTS_STATUS_TIMEOUT)
    }

    return () => timer && clearTimeout(timer)
  }, [condition])

  return useQuery<Job>({
    queryKey: ['receiptsStatus', network, lockAddress],
    queryFn: fetchReceiptsStatus,
    enabled: !timeoutReached,
    refetchInterval:
      condition && !timeoutReached ? RECEIPTS_STATUS_REFETCH_INTERVAL : false,
  })
}
