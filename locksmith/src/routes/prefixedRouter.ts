import express from 'express'

module.exports = (transactionRouter: any) => {
  const router = express.Router()

  router.use('/', transactionRouter)
  router.use('/:chain', transactionRouter)

  return router
}
