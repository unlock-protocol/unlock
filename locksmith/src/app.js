const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const Sequelize = require('sequelize')
const ethJsUtil = require('ethereumjs-util')
const tokenMiddleware = require('./tokenMiddleware')
const Lock = require('./lock')
const Transaction = require('./transaction')
const logger = require('./locksmithLogger')

const app = express()
const router = express.Router()

const Op = Sequelize.Op

router.put('/lock/:lockAddress', async (req, res) => {
  let newAddress = ethJsUtil.toChecksumAddress(req.body.address)
  let tempAddress = ethJsUtil.toChecksumAddress(req.params.lockAddress)

  if (tempAddress && newAddress) {
    try {
      let lock = await Lock.findOne({
        where: {
          address: { [Op.eq]: tempAddress },
          owner: { [Op.eq]: req.owner },
        },
        raw: true,
      })

      lock.address = newAddress
      let updatedLock = await Lock.create(lock)
      logger.logLockClone(tempAddress, updatedLock.address)
      res.sendStatus(202)
    } catch (e) {
      logger.logCloneUnable(tempAddress, req.owner)
      res.sendStatus(412)
    }
  } else {
    logger.logCloneMissingInfo(tempAddress)
    res.sendStatus(428)
  }
})

router.post('/lock', async (req, res) => {
  let lock = req.body
  if (lock.address && lock.name) {
    let lockAddress = ethJsUtil.toChecksumAddress(lock.address)
    let lockOwner = ethJsUtil.toChecksumAddress(req.owner)

    try {
      await Lock.create({
        name: lock.name,
        address: lockAddress,
        owner: lockOwner,
      })
      logger.logLockDetailsStored(lockAddress)
      res.sendStatus(200)
    } catch (e) {
      logger.logAttemptedOverwrite(lockAddress)
      res.sendStatus(412)
    }
  } else {
    res.sendStatus(400)
  }
})

router.get('/lock/:lockAddress', async (req, res) => {
  let lockAddress = ethJsUtil.toChecksumAddress(req.params.lockAddress)
  logger.logLockDetailsRequest(lockAddress)

  let lock = await Lock.findOne({
    where: { address: { [Op.eq]: lockAddress } },
  })

  if (lock == null) {
    res.sendStatus(404)
  } else {
    res.json({
      name: lock.name,
    })
  }
})

router.get('/:owner/locks', async (req, res) => {
  const owner = ethJsUtil.toChecksumAddress(req.params.owner)

  let locks = await Lock.findAll({
    attributes: ['name', 'address'],
    where: {
      owner: { [Op.eq]: owner },
    },
  })

  res.json({ locks: locks })
})

router.post('/transaction', async (req, res) => {
  let transaction = req.body

  if (
    transaction.transactionHash &&
    transaction.sender &&
    transaction.recipient
  ) {
    try {
      await Transaction.create({
        transactionHash: transaction.transactionHash,
        sender: ethJsUtil.toChecksumAddress(transaction.sender),
        recipient: ethJsUtil.toChecksumAddress(transaction.recipient),
      })
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(400)
    }
  }
})

router.get('/transactions', async (req, res) => {
  const sender = ethJsUtil.toChecksumAddress(req.query.sender)

  let transactions = await Transaction.findAll({
    where: {
      sender: { [Op.eq]: sender },
    },
  })

  res.json({ transactions: transactions })
})

app.use(cors())
app.use(bodyParser.json())
app.put(/^\/lock\/\S+/i, tokenMiddleware)
app.post(/^\/lock$/i, tokenMiddleware)
app.use('/', router)

module.exports = app
