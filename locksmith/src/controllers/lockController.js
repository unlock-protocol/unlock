import LockOwnership from '../data/lockOwnership'

const logger = require('../locksmithLogger')
const lockOperations = require('../operations/lockOperations')
const lockIconUtils = require('../utils/lockIcon').default
const { getBaseTokenData } = require('../operations/metadataOperations')

const config = require('../../config/config')

const { getLockByAddress, getLocksByOwner, createLock } = lockOperations

const lockSave = async (req, res) => {
  const { lock } = req.body.message

  const databaseLock = await getLockByAddress(lock.address)

  // If the lock does not exist
  if (!databaseLock) {
    lock.chain = req.chain
    await createLock(lock)
    logger.logLockDetailsStored(lock.address)
    return res.sendStatus(200)
  }
}

const lockGet = async (req, res) => {
  logger.logLockDetailsRequest(req.params.lockAddress)
  // Serve lock metadata!
  const baseTokenData = await getBaseTokenData(
    req.params.lockAddress,
    `${req.protocol}://${req.headers.host}`
  )

  res.json(baseTokenData)
}

const lockOwnerGet = async (req, res) => {
  const locks = await getLocksByOwner(req.params.owner)
  return res.json({ locks })
}

const lockOwnershipCheck = async (req, res) => {
  const { lockAddress } = req.params
  LockOwnership.update(config.web3ProviderHost, [lockAddress])
  return res.sendStatus(200)
}

/**
 * Yiels the SVG icon for the lock
 * @param {*} req
 * @param {*} res
 */
const lockIcon = async (req, res) => {
  const { lockAddress } = req.params
  const svg = lockIconUtils.lockIcon(lockAddress)
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
