import express from 'express'
import { purchase } from '../../controllers/v2/magicEdenController'

const router = express.Router({ mergeParams: true })

router.post('/purchase/:network/:lockAddress', purchase)

export default router
