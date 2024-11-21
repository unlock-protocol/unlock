import express from 'express'
import { createMerkleTree } from '../../controllers/v2/merkleTreeController'

const router: express.Router = express.Router({ mergeParams: true })

router.post('/', createMerkleTree)

export default router
