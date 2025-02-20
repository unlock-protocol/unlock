import { z } from 'zod'
import { Request, Response } from 'express'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { uploadJsonToS3 } from '../../utils/s3'
import config from '../../config/config'

/**
 * A tree entry can either be:
 * - a string (recipient) which will assign a fixed amount of "1", or
 * - a tuple of [recipient, amount] where amount can be a number or a string, ideal for airdrops with varying amounts.
 */
const RawMerkleTreeEntry = z.union([
  z.string(),
  z.tuple([z.string(), z.union([z.string(), z.number()])]),
])

/**
 * CreateMerkleTreeEntries first validates that the array does not contain mixed types.
 * Then it transforms the array into a normalized array of [recipient, amount] with amount as a string.
 */
const CreateMerkleTreeEntries = z
  .array(RawMerkleTreeEntry)
  .refine(
    (entries) => {
      if (entries.length === 0) return true
      // If first element is a string, all entries must be strings
      const isSimpleList = typeof entries[0] === 'string'
      return entries.every((entry) =>
        isSimpleList ? typeof entry === 'string' : Array.isArray(entry)
      )
    },
    {
      message:
        'All entries must be of the same type: either simple recipient strings or [recipient, amount] tuples.',
    }
  )
  .transform((entries) => {
    if (entries.length === 0 || typeof entries[0] === 'string') {
      return (entries as string[]).map(
        (recipient) => [recipient, '1'] as [string, string]
      )
    } else {
      return (entries as [string, number | string][]).map(
        ([recipient, amount]) => [recipient, amount.toString()]
      )
    }
  })

/**
 * createMerkleTree function that handles both types of payloads.
 *
 * If the payload is an array of strings, it assigns a fixed amount "1" to each address.
 * If the payload is an array of [recipient, amount] tuples, it uses the provided amount (normalized to a string).
 * The second format is particularly useful for airdrops where different recipients receive different amounts.
 */
export const createMerkleTree = async (
  request: Request,
  response: Response
) => {
  const normalizedEntries = await CreateMerkleTreeEntries.parseAsync(
    request.body
  )

  const tree = StandardMerkleTree.of(normalizedEntries, ['address', 'uint256'])

  // dump the tree
  const fullTree = tree.dump()

  // Then, store the tree (at <slug>.json)
  await uploadJsonToS3(
    config.storage.merkleTreesBucket,
    `${tree.root}.json`,
    fullTree
  )

  response.status(200).send({ root: tree.root })
}
