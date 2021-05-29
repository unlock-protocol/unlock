import express from 'express'

const router = express.Router({ mergeParams: true })

router.get('/', (_, res) => {
  res.sendStatus(200)
})

module.exports = router
