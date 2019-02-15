const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const Sequelize = require('sequelize')
const ethJsUtil = require('ethereumjs-util')
const signatureValidationMiddleware = require('./signatureValidationMiddleware')
const Lock = require('./lock')
const Transaction = require('./transaction')
const logger = require('./locksmithLogger')

const app = express()
const router = express.Router()

const Op = Sequelize.Op

router.put('/lock/:lockAddress', async (req, res) => {
  let lock = req.body.message.lock

  if (lock && lock.address == req.params.lockAddress) {
    try {
      let result = await Lock.update(
        { name: lock.name },
        {
          where: {
            address: {
              [Op.eq]: ethJsUtil.toChecksumAddress(req.params.lockAddress),
            },
            owner: { [Op.eq]: ethJsUtil.toChecksumAddress(lock.owner) },
          },
          raw: true,
        }
      )

      if (result[0] > 0) {
        res.sendStatus(202)
      } else {
        res.sendStatus(412)
      }
    } catch (e) {
      res.sendStatus(412)
    }
  } else {
    res.sendStatus(412)
  }
})

router.post('/lock', async (req, res) => {
  let lock = req.body.message.lock

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
      await Transaction.findOrCreate({
        where: {
          transactionHash: transaction.transactionHash,
        },
        defaults: {
          transactionHash: transaction.transactionHash,
          sender: ethJsUtil.toChecksumAddress(transaction.sender),
          recipient: ethJsUtil.toChecksumAddress(transaction.recipient),
        },
      })
      res.sendStatus(202)
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
app.put(/^\/lock\/\S+/i, signatureValidationMiddleware)
app.post(/^\/lock$/i, signatureValidationMiddleware)
app.use('/', router)

module.exports = app
