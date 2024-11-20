import express from 'express'
import {
  createMerkleTree,
  getMerkleTree,
} from '../../controllers/v2/merkleTreeController'

const router: express.Router = express.Router({ mergeParams: true })

router.post('/', createMerkleTree)
router.get('/:root', getMerkleTree)

export default router
