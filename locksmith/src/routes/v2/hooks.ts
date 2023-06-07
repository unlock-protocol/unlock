import express from 'express'
import { guildHook } from '../../controllers/v2/hooksController'

const router = express.Router({ mergeParams: true })

router.get('/guild', guildHook)

export default router
