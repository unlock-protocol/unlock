import express from 'express'

let router = express.Router()

router.get('/', (_, res) => {
  res.sendStatus(200)
})

module.exports = router
