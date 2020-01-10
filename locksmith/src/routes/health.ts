import express from 'express'

const router = express.Router()

router.get('/', (_, res) => {
  res.sendStatus(200)
})

module.exports = router
