import express from 'express'
import { createHookHandler } from '../controllers/hookController'

const router: any = express.Router({ mergeParams: true })

router.post('/:network/locks', createHookHandler('locks'))
router.post('/:network/locks/:lock/keys', createHookHandler('keys'))

export default router
