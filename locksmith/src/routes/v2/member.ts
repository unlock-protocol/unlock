import express from 'express'
import MemberController from '../../controllers/v2/memberController'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'

const router = express.Router({ mergeParams: true })

const memberController = new MemberController()

router.get(
  '/:network/locks/:lockAddress/members',
  authenticatedMiddleware,
  (req, res) => {
    memberController.members(req, res)
  }
)

module.exports = router
