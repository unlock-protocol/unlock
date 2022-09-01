import parseDataUri from 'parse-data-uri'
import migrateLock from '../utils/lockMigrate'
import stripeOperations from '../operations/stripeOperations'
import LockOwnership from '../data/lockOwnership'
import { evaluateLockOwnership } from './metadataController'
import * as Normalizer from '../utils/normalizer'
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
  getLockMigration,
} = lockOperations

const lockSave = async (req, res) => {
  const { lock } = req.body.message

  const databaseLock = await getLockByAddress(lock.address)

  // If the lock does not exist
  if (!databaseLock) {
    lock.chain = req.chain
    await createLock(lock)
  }
  return res.sendStatus(200)
}

const lockGet = async (req, res) => {
  // Serve lock metadata!
  const baseTokenData = await getBaseTokenData(
    req.params.lockAddress,
    `${req.protocol}://${req.headers.host}`
  )
  res.json(baseTokenData)
}

// ?lockAddress
// pass ?force=1 param to bypass unique check
const lockMigrate = async (req, res) => {
  const { lockAddress } = req.params
  const { force } = req.query
  const unlockVersion = req.query.unlockVersion || 9
  const chainId = req.query.chainId || 31337

  const lockMigration = await getLockMigration(lockAddress, chainId)
  if (lockMigration && lockMigration.success) {
    return res.send(
      401,
      `Lock already migrated to ${lockMigration.newLockAddress}.`
    )
  }

  if (lockMigration && !force) {
    return res.send(401, 'A migration is already ongoing.')
  }

  // record the migration in db
  const dbRecord = await LockMigrations.create({
    lockAddress,
    initiatedBy: req.signee,
    chain: chainId,
    migrated: false,
  })
  const recordId = dbRecord.dataValues.id
  // This is a promise but we won't await for it to resolve because it takes forever
  // No memory leak: JS will garbage collect even if it does not "resolve".
  migrateLock(
    {
      lockAddress,
      unlockVersion,
      chainId: parseInt(chainId),
      recordId,
    },
    (error, { message }) => {
      updateLockMigrationsLog(recordId, message)
      if (error) {
        // "expected" error
        const message = `Failed to migrate lock ${lockAddress}, ${chainId}. ${error.message}`
        updateLockMigrationsLog(recordId, message)
        logger.error(message, error)
        dbRecord.update({
          migrated: false,
        })
      }
    }
  )
    .then((newLockAddress) => {
      dbRecord.update({
        newLockAddress,
        migrated: true,
      })
    })
    .catch((error) => {
      // Unexpected error
      const message = `Failed to migrate lock ${lockAddress}, ${chainId}. ${error.message}`
      updateLockMigrationsLog(recordId, message)
      logger.error(message, error)
      dbRecord.update({
        migrated: false,
      })
    })

  res.json({
    lockAddress,
    message: 'Lock migration initiated.',
  })
}

const lockMigrateStatus = async (req, res) => {
  const { lockAddress } = req.params
  const chainId = req.query.chainId || 31337
  const lockMigration = await getLockMigration(lockAddress, chainId)
  if (lockMigration === null) return res.sendStatus(404)
  res.json(lockMigration)
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
  let lockIcon

  let renderDefaultForLock = () => {
    const svg = lockIconUtils.lockIcon(lockAddress)
    res.setHeader('Content-Type', 'image/svg+xml')
    return res.send(svg)
  }

  try {
    if (original !== '1') {
      lockIcon = await LockIcons.findOne({
        where: { lock: Normalizer.ethereumAddress(lockAddress) },
      })
    }

    if (lockIcon) {
      if (lockIcon.icon.startsWith('data:')) {
        const parsedDataUri = parseDataUri(lockIcon.icon)
        res.setHeader('Content-Type', parsedDataUri.mimeType)
        return res.send(parsedDataUri.data)
      } else {
        // This is just a regular URL redirect
        return res.redirect(lockIcon.icon)
      }
    } else {
      return renderDefaultForLock()
    }
  } catch (e) {
    logger.error(`Could not serve icon for ${lockAddress}`, e)
    return renderDefaultForLock()
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

const disconnectStripe = async (req, res) => {
  const { message, icon } = req.body
  const { lockAddress, chain, lockManager } = message['Unlink Stripe']

  try {
    const isAuthorized = await evaluateLockOwnership(
      Normalizer.ethereumAddress(lockAddress),
      Normalizer.ethereumAddress(lockManager),
      parseInt(chain)
    )
    if (!isAuthorized) {
      return res
        .status(401)
        .send(
          `${req.signee} is not a lock manager for ${lockAddress} on ${chain}`
        )
    } else {
      const deleted = await stripeOperations.disconnectStripe({
        lockManager: Normalizer.ethereumAddress(req.signee),
        lockAddress: Normalizer.ethereumAddress(lockAddress),
        chain,
      })

      if (deleted) {
        res.status(200)
      } else {
        res.status(204)
      }
    }
  } catch (err) {
    logger.error('There is some unexpected issue, please try again', err)
    res.status(500).send(err)
  }
}

module.exports = {
  lockGet,
  lockMigrate,
  lockMigrateStatus,
  lockOwnerGet,
  lockSave,
  lockOwnershipCheck,
  lockIcon,
  connectStripe,
  stripeConnected,
  changeLockIcon,
  disconnectStripe,
}
