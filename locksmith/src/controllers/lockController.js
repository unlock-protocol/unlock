const Sequelize = require('sequelize')
const ethJsUtil = require('ethereumjs-util')
const logger = require('../locksmithLogger')
const Lock = require('../lock')

const Op = Sequelize.Op

const lockUpdate = async (req, res) => {
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
}

const lockCreate = async (req, res) => {
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
}

const lockGet = async (req, res) => {
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
}

const lockOwnerGet = async (req, res) => {
  const owner = ethJsUtil.toChecksumAddress(req.params.owner)

  let locks = await Lock.findAll({
    attributes: ['name', 'address'],
    where: {
      owner: { [Op.eq]: owner },
    },
  })

  res.json({ locks: locks })
}

module.exports = { lockGet, lockOwnerGet, lockCreate, lockUpdate }
