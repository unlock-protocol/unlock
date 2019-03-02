const Sequelize = require('sequelize')
const ethJsUtil = require('ethereumjs-util')
const logger = require('../locksmithLogger')
const Lock = require('../lock')

const Op = Sequelize.Op

const lockSave = async (req, res) => {
  let lock = req.body.message.lock

  if (lock.name && lock.owner && lock.address) {
    // First: find the lock if it exists
    let databaseLock = await Lock.findOne({
      where: { address: { [Op.eq]: lock.address } },
    })
    // If it does not: easy, we create a new one
    if (!databaseLock) {
      try {
        await Lock.create({
          name: lock.name,
          address: lock.address,
          owner: lock.owner,
        })
      } catch (error) {
        logger.logFailureToStoreLock(error)
        res.sendStatus(500)
      }
      logger.logLockDetailsStored(lock.address)
      return res.sendStatus(200)
    } else {
      // If it does exist, check that the owner is correct
      if (lock.owner !== databaseLock.owner) {
        logger.logAttemptedOverwrite(lock.address)
        return res.sendStatus(401)
      }

      // Udpate, with a constraint on the owner
      let result = await Lock.update(
        { name: lock.name },
        {
          where: {
            address: {
              [Op.eq]: ethJsUtil.toChecksumAddress(lock.address),
            },
            owner: { [Op.eq]: ethJsUtil.toChecksumAddress(lock.owner) },
          },
          raw: true,
        }
      )
      if (result[0] > 0) {
        logger.logAttemptedOverwrite(lock.address)
        return res.sendStatus(202)
      } else {
        logger.logLockDetailsStored(lock.address)
        return res.sendStatus(412)
      }
    }
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

module.exports = { lockGet, lockOwnerGet, lockSave }
