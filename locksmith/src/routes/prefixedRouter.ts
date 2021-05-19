import express from 'express'

module.exports = (customRouter: any) => {
  const router = express.Router()

  router.use('/', customRouter)
  router.use('/:chain/', customRouter)

  return router
}
