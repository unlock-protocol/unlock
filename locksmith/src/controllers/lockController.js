import LockOwnership from '../data/lockOwnership'

const logger = require('../locksmithLogger')
const lockOperations = require('../operations/lockOperations')
const lockIconUtils = require('../../src/utils/lockIcon').default

const config = require('../../config/config')

const { getLockByAddress, getLocksByOwner, createLock } = lockOperations

const lockSave = async (req, res) => {
  let lock = req.body.message.lock

  const databaseLock = await getLockByAddress(lock.address)

  // If the lock does not exist
  if (!databaseLock) {
    await createLock(lock)
    logger.logLockDetailsStored(lock.address)
    return res.sendStatus(200)
  }
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

const lockOwnershipCheck = async (req, res) => {
  let lockAddress = req.params.lockAddress
  LockOwnership.update(config.web3ProviderHost, [lockAddress])
  return res.sendStatus(200)
}

/**
 * Yiels the SVG icon for the lock
 * @param {*} req
 * @param {*} res
 */
const lockIcon = async (req, res) => {
  let lockAddress = req.params.lockAddress
  let svg = lockIconUtils.lockIcon(lockAddress)
  res.setHeader('Content-Type', 'image/svg+xml')
  return res.send(svg)
}

module.exports = {
  lockGet,
  lockOwnerGet,
  lockSave,
  lockOwnershipCheck,
  lockIcon,
}
