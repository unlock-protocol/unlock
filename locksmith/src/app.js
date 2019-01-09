const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const Sequelize = require('sequelize')
const tokenMiddleware = require('./token_middleware')
const Lock = require('./lock')
const logger = require('./locksmithLogger')

const app = express()
const router = express.Router()

const Op = Sequelize.Op

router.put('/lock/:lockAddress', function(req, res) {
  let newAddress = req.body.address
  let tempAddress = req.params.lockAddress

  if (tempAddress && newAddress) {
    Lock.findOne({
      where: {
        address: { [Op.eq]: tempAddress },
        owner: { [Op.eq]: req.owner },
      },
      raw: true,
    })
      .then(result => {
        result.address = newAddress
        Lock.create(result).then(() => {
          logger.logLockClone(tempAddress, result.address)
          res.sendStatus(202)
        })
      })
      .catch(() => {
        logger.logCloneUnable(tempAddress, req.owner)
        res.sendStatus(412)
      })
  } else {
    logger.logCloneMissingInfo(tempAddress)
    res.sendStatus(428)
  }
})

router.post('/lock', function(req, res) {
  let lock = req.body
  if (lock.address && lock.name) {
    Lock.create({
      name: lock.name,
      address: lock.address,
      owner: req.owner,
    })
      .then(() => {
        logger.logLockDetailsStored(lock.address)
        res.sendStatus(200)
      })
      .catch(() => {
        logger.logAttemptedOverwrite(lock.address)
        res.sendStatus(412)
      })
  } else {
    res.sendStatus(400)
  }
})

router.get('/lock/:lockAddress', function(req, res) {
  logger.logLockDetailsRequest(req.params.lockAddress)
  Lock.findOne({
    where: { address: { [Op.eq]: req.params.lockAddress } },
  }).then(lock => {
    if (lock == null) {
      res.sendStatus(404)
    } else {
      res.json({
        name: lock.name,
      })
    }
  })
})

app.use(cors())
app.use(bodyParser.json())
app.put(/^\/lock\/\S+/i, tokenMiddleware)
app.post(/^\/lock$/i, tokenMiddleware)
app.use('/', router)

module.exports = app
