import { z } from 'zod'
import { Request, Response } from 'express'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { uploadJsonToS3 } from '../../utils/s3'
import config from '../../config/config'

const CreateMerkleTreeBody = z.array(z.string())

export const createMerkleTree = async (
  request: Request,
  response: Response
) => {
  const addresses = await CreateMerkleTreeBody.parseAsync(request.body)

  const tree = StandardMerkleTree.of(
    addresses.map((recipient) => [recipient, '1']),
    ['address', 'uint256']
  )
  // dump the tree
  const fullTree = tree.dump()

  // Then, store the tree (at <slug>.json)
  await uploadJsonToS3(
    config.storage.merkleTreesBucket,
    `${tree.root}.json`,
    fullTree
  )

  response.status(200).send({ root: tree.root })
  return
}
