import express from 'express'

const router = express.Router({ mergeParams: true })

router.get('/', (_, res) => {
  res.status(200).send('OK')
})

export default router
