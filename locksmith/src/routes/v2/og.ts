import express from 'express'
import { eventOGHandler } from '../../controllers/v2/og'

const router: express.Router = express.Router({ mergeParams: true })

router.get('/event/:network/locks/:lockAddress', eventOGHandler)

export default router
