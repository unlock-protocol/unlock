import stripeOperations from '../operations/stripeOperations'
import LockOwnership from '../data/lockOwnership'
import MetadataController from './metadataController'

const lockOperations = require('../operations/lockOperations')
const lockIconUtils = require('../utils/lockIcon').default
const { getBaseTokenData } = require('../operations/metadataOperations')

const { getLockByAddress, getLocksByOwner, createLock } = lockOperations

const lockSave = async (req, res) => {
  const { lock } = req.body.message

  const databaseLock = await getLockByAddress(lock.address)

  // If the lock does not exist
  if (!databaseLock) {
    lock.chain = req.chain
    await createLock(lock)
    return res.sendStatus(200)
  }
}

const lockGet = async (req, res) => {
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
  LockOwnership.update([lockAddress], req.chain)
  return res.sendStatus(200)
}

const connectStripe = async (req, res) => {
  const { lockAddress } = req.params
  const { lockManager } = req.query

  // TODO: check that signer is lockManager!!

  if (!lockAddress || !lockManager) {
    return res.sendStatus(401)
  }
  const links = await stripeOperations.connectStripe(
    lockManager,
    lockAddress,
    req.chain
  )
  return res.json(links)
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
  connectStripe,
}
