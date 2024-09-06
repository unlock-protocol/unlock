import { Task } from 'graphile-worker'
import { z } from 'zod'
import {
  KeyOrderBy,
  OrderDirection,
  SubgraphKey,
  SubgraphService,
} from '@unlock-protocol/unlock-js'
import { Payload } from '../../models/payload'
import normalizer from '../../utils/normalizer'
import {
  getReceiptsZipName,
  zipReceiptsAndSendtos3,
} from '../../utils/receipts'

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
  const uploaded = await zipReceiptsAndSendtos3(lockAddress, network)
  const key = getReceiptsZipName(lockAddress, network)

  if (uploaded) {
    await Payload.upsert(
      {
        id,
        payload: {
          status: 'success',
          key,
        },
      },
      {
        conflictFields: ['id'],
      }
    )
  }
}
