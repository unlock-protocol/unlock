import { Task } from 'graphile-worker'
import { z } from 'zod'
import {
  KeyOrderBy,
  OrderDirection,
  SubgraphKey,
  SubgraphService,
} from '@unlock-protocol/unlock-js'
import { Payload } from '../../models/payload'
import { Receipt, ReceiptBase } from '../../models'
import normalizer from '../../utils/normalizer'

const TaskPayload = z.object({
  lockAddress: z
    .string()
    .transform((value) => normalizer.ethereumAddress(value.trim())),
  network: z.coerce.number(),
  id: z.string(),
})

interface AllKeysOptions {
  lockAddress: string
  network: number
}
/**
 * Fetch all the keys using token IDs from the subgraph for a given lock.
 * The subgraph has a limit of 1000 items per query, so we need to paginate through the results.
 */

export const allKeys = async ({ lockAddress, network }: AllKeysOptions) => {
  const subgraphService = new SubgraphService()
  let finished = true
  const keys: SubgraphKey[] = []
  let start = 0
  while (finished) {
    const result = await subgraphService.keys(
      {
        first: 1000,
        where: {
          tokenId_gt: start.toString(),
          tokenId_lt: (start + 1000).toString(),
          lock: lockAddress.toLowerCase().trim(),
        },
        orderBy: KeyOrderBy.TokenId,
        orderDirection: OrderDirection.Asc,
      },
      {
        networks: [network],
      }
    )
    const items = result as unknown as SubgraphKey[]
    keys.push(...items)
    if (!items.length) {
      finished = false
    } else {
      start += 1000
    }
  }
  return keys
}

export const downloadReceipts: Task = async (payload) => {
  const { lockAddress, network, id } = await TaskPayload.parseAsync(payload)
  const [keys, receipts, base] = await Promise.all([
    allKeys({
      lockAddress,
      network,
    }),
    Receipt.findAll({
      where: {
        lockAddress,
        network,
      },
    }),
    ReceiptBase.findOne({
      where: {
        lockAddress,
        network,
      },
    }),
  ])

  const receiptsDataMap = receipts.reduce<Record<string, Receipt>>(
    (map, receiptData) => {
      map[receiptData.id] = receiptData
      return map
    },
    {}
  )

  const items = keys.map((item) => {
    const receiptData = receiptsDataMap[item.tokenId]
    return {
      ...item,
      fullName: receiptData?.fullname,
      vat: base?.vat,
      service: base?.servicePerformed,
      supplier: base?.supplierName,
      supplierAddress:
        base?.addressLine1 && base?.addressLine2
          ? `${base?.addressLine1}\n${base}`
          : base?.addressLine1 || base?.addressLine2 || '',
    } as any
  })

  await Payload.upsert(
    {
      id,
      payload: {
        status: 'success',
        result: items,
      },
    },
    {
      conflictFields: ['id'],
    }
  )
}
