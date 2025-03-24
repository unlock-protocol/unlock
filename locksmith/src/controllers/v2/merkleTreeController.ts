import { z, ZodError } from 'zod'
import { RequestHandler } from 'express'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { uploadJsonToS3 } from '../../utils/s3'
import config from '../../config/config'
import * as Normalizer from '../../utils/normalizer'

/**
 * A tree entry can either be:
 * - a string (recipient) which will assign a fixed amount of "1", or
 * - a tuple of [recipient, amount] where amount can be a number or a string, ideal for airdrops with varying amounts.
 */
const RawMerkleTreeEntry = z.union([
  z.string().transform((address) => Normalizer.ethereumAddress(address)),
  z.tuple([
    z.string().transform((address) => Normalizer.ethereumAddress(address)),
    z.union([z.string(), z.number()]),
  ]),
])

/**
 * CreateMerkleTreeEntries first validates that the array does not contain mixed types.
 * Then it transforms the array into a normalized array of [recipient, amount] with amount as a string.
 */
const CreateMerkleTreeEntries = z
  .array(RawMerkleTreeEntry)
  .refine(
    (entries) => {
      if (entries.length === 0) return false // Reject empty arrays
      const isSimpleList = typeof entries[0] === 'string'
      return entries.every((entry) =>
        isSimpleList ? typeof entry === 'string' : Array.isArray(entry)
      )
    },
    {
      message:
        'All entries must be of the same type: either simple recipient strings or [recipient, amount] tuples. Empty arrays are not allowed.',
    }
  )
  .transform((entries) => {
    if (typeof entries[0] === 'string') {
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
 * Empty arrays are rejected with a 400 status code.
 */
export const createMerkleTree: RequestHandler = async (request, response) => {
  try {
    const normalizedEntries = await CreateMerkleTreeEntries.parseAsync(
      request.body
    )

    const tree = StandardMerkleTree.of(normalizedEntries, [
      'address',
      'uint256',
    ])

    // dump the tree
    const fullTree = tree.dump()

    // Store the tree (at <root>.json)
    await uploadJsonToS3(
      config.storage.merkleTreesBucket,
      `${tree.root}.json`,
      fullTree
    )

    response.status(200).send({ root: tree.root })
    return
  } catch (error: any) {
    if (error instanceof ZodError) {
      response.status(400).json({ error: { issues: error.errors } })
      return
    }
    response.status(400).json({ error })
    return
  }
}
