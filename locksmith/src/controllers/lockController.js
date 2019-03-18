const logger = require('../locksmithLogger')
const lockOperations = require('../operations/lockOperations')

const {
  getLockByAddress,
  getLocksByOwner,
  createLock,
  updateLock,
} = lockOperations

const lockSave = async (req, res) => {
  let lock = req.body.message.lock

  const databaseLock = await getLockByAddress(lock.address)

  // If the lock does not exist
  if (!databaseLock) {
    await createLock(lock)
    logger.logLockDetailsStored(lock.address)
    return res.sendStatus(200)
  }

  // If the lock has an owner which is different
  if (databaseLock.owner !== lock.owner) {
    logger.logAttemptedOverwrite(lock.address)
    return res.sendStatus(401)
  }

  // Update  the lock
  await updateLock(lock)
  logger.logLockDetailsStored(lock.address)
  return res.sendStatus(202)
}

const lockGet = async (req, res) => {
  logger.logLockDetailsRequest(req.params.lockAddress)
  const lock = await getLockByAddress(req.params.lockAddress)
  if (!lock) {
    return res.sendStatus(404)
  }
  res.json({
    name: lock.name,
  })
}

const lockOwnerGet = async (req, res) => {
  const locks = await getLocksByOwner(req.params.owner)
  return res.json({ locks: locks })
}

module.exports = { lockGet, lockOwnerGet, lockSave }
