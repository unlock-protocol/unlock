import express from 'express'
import { gitcoinHook, guildHook } from '../../controllers/v2/hooksController'

const router: express.Router = express.Router({ mergeParams: true })

router.get('/guild', guildHook)

router.get('/gitcoin', gitcoinHook)

export default router
