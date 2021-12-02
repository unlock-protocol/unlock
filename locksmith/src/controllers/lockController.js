import parseDataUri from 'parse-data-uri'
import stripeOperations from '../operations/stripeOperations'
import LockOwnership from '../data/lockOwnership'
import { evaluateLockOwnership } from './metadataController'
import * as Normalizer from '../utils/normalizer'
import migrateLock, { migrateLogEvent } from '../utils/lockMigrate'
import { LockIcons, LockMigrations } from '../models'

import logger from '../logger'

const lockOperations = require('../operations/lockOperations')
const lockIconUtils = require('../utils/lockIcon').default
const { getBaseTokenData } = require('../operations/metadataOperations')

const {
  getLockByAddress,
  getLocksByOwner,
  createLock,
  updateLockMigrationsLog,
} = lockOperations

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

migrateLogEvent.on('migrateLock', async ({ recordId, msg }) => {
  console.log('migrateLogEvent', recordId, msg)
  await updateLockMigrationsLog(recordId, msg)
})

const lockMigrate = async (req, res) => {
  const { lockAddress } = req.params
  const unlockVersion = req.query.unlockVersion || 9
  const chainId = req.chain

  // TODO: make sure lock exists
  // const databaseLock = await getLockByAddress(lockAddress)
  // if (!databaseLock) res.send(404)

  // record the migration in db
  const dbRecord = await LockMigrations.create({
    lockAddress,
    // initiatedBy: msg.sender // TODO: get that info somewhere?
    chain: chainId,
    migrated: false,
  })
  const recordId = dbRecord.dataValues.id

  try {
    // init migrate process
    const { newLockAddress } = await migrateLock({
      lockAddress,
      unlockVersion,
      chainId,
      recordId,
    })

    // update db on success
    dbRecord.update({
      newLockAddress,
      migrated: true,
    })

    res.json({
      lockAddress,
      newLockAddress,
    })
  } catch (error) {
    await updateLockMigrationsLog(recordId, error.message)
    res.status(503).json({
      error: error.message,
      migrated: false,
    })
  }
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
  const { message } = JSON.parse(decodeURIComponent(req.query.data))
  // A previous middleware will have evaluated everything and assign a signee
  const { lockAddress, chain, baseUrl } = message['Connect Stripe']
  try {
    const isAuthorized = await evaluateLockOwnership(
      lockAddress,
      req.signee,
      parseInt(chain)
    )
    if (!isAuthorized) {
      res
        .status(401)
        .send(
          `${req.signee} is not a lock manager for ${lockAddress} on ${chain}`
        )
    } else {
      const links = await stripeOperations.connectStripe(
        Normalizer.ethereumAddress(req.signee),
        Normalizer.ethereumAddress(lockAddress),
        chain,
        baseUrl
      )
      return res.json(links)
    }
  } catch (error) {
    logger.error(
      `Failed to connect Stripe: there was an error ${lockAddress}, ${chain}`,
      error
    )
    res.status(401).send(`Cannot connect stripe: ${error.message}`)
  }
}

const stripeConnected = async (req, res) => {
  try {
    const stripeConnected = await stripeOperations.getStripeConnectForLock(
      Normalizer.ethereumAddress(req.params.lockAddress),
      req.chain
    )

    if (stripeConnected !== -1 && stripeConnected !== 0) {
      return res.json({ connected: 1 })
    }
    return res.json({ connected: stripeConnected })
  } catch (error) {
    logger.error(
      'Cannot verified if Stripe is connected: there was an error',
      error
    )
    res.status(500).send(error)
  }
}

/**
 * Yiels the SVG icon for the lock
 * @param {*} req
 * @param {*} res
 */
const lockIcon = async (req, res) => {
  const { lockAddress } = req.params
  const { original } = req.query
  try {
    if (original !== '1') {
      const lockIcon = await LockIcons.findOne({
        where: { lock: Normalizer.ethereumAddress(lockAddress) },
      })

      if (lockIcon) {
        if (lockIcon.icon.startsWith('data:')) {
          const parsedDataUri = parseDataUri(lockIcon.icon)
          res.setHeader('Content-Type', parsedDataUri.mimeType)
          return res.send(parsedDataUri.data)
        } else {
          // This is just a regular URL redirect
          return res.redirect(lockIcon.icon)
        }
      }
    }
  } catch (e) {
    console.error(`Could not serve icon for ${lockAddress}`)
  } finally {
    const svg = lockIconUtils.lockIcon(lockAddress)
    res.setHeader('Content-Type', 'image/svg+xml')
    res.send(svg)
  }
}

const changeLockIcon = async (req, res) => {
  const { message, icon } = req.body
  const { lockAddress, chain, lockManager } = message['Update Icon']

  const isAuthorized = await evaluateLockOwnership(
    lockAddress,
    lockManager,
    parseInt(chain)
  )
  if (!isAuthorized) {
    return res
      .status(401)
      .send(
        `${req.signee} is not a lock manager for ${lockAddress} on ${chain}`
      )
  } else {
    let lockIcon = await LockIcons.findOne({
      where: {
        chain,
        lock: Normalizer.ethereumAddress(lockAddress),
      },
    })
    if (lockIcon) {
      lockIcon.icon = icon
      await lockIcon.save()
    } else {
      lockIcon = await LockIcons.create({
        chain,
        lock: Normalizer.ethereumAddress(lockAddress),
        icon: icon,
      })
    }
  }

  return res.status(200).send('OK')
}

module.exports = {
  lockGet,
  lockMigrate,
  lockOwnerGet,
  lockSave,
  lockOwnershipCheck,
  lockIcon,
  connectStripe,
  stripeConnected,
  changeLockIcon,
}
