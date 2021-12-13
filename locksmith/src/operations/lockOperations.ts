import ethJsUtil = require('ethereumjs-util')
import Sequelize = require('sequelize')

const models = require('../models')

const { Op, fn, col } = Sequelize
const { Lock, UserTokenMetadata, LockMigrations } = models

/**
 * Creates a lock. Normalizes addresses before saving.
 * @param {*} lock
 */
export async function createLock(lock: any) {
  return Lock.create({
    chain: lock.chain,
    address: ethJsUtil.toChecksumAddress(lock.address),
    owner: ethJsUtil.toChecksumAddress(lock.owner),
  })
}

/**
 * Get a lock by its address
 * @param {*} address
 */
export async function getLockByAddress(address: string) {
  return Lock.findOne({
    attributes: Lock.publicFields,
    where: {
      address: { [Op.eq]: ethJsUtil.toChecksumAddress(address) },
    },
  })
}

/**
 * Retrieve all locks by an owner
 * @param {*} owner
 */
export async function getLocksByOwner(owner: string) {
  return Lock.findAll({
    attributes: Lock.publicFields,
    where: {
      owner: { [Op.eq]: ethJsUtil.toChecksumAddress(owner) },
    },
  })
}

export async function getLockAddresses() {
  const lockAddresses = await Lock.findAll({ attributes: ['address'] })
  return lockAddresses.map((lockAddress: any) => lockAddress.address)
}

export async function updateLockOwnership(
  address: string,
  owner: string,
  chain: number
) {
  return Lock.upsert(
    {
      chain,
      address: ethJsUtil.toChecksumAddress(address),
      owner: ethJsUtil.toChecksumAddress(owner),
    },
    {
      fields: ['owner'],
    }
  )
}

export async function getKeyHolderMetadata(
  address: string,
  keyHolders: [string],
  network: number
) {
  return UserTokenMetadata.findAll({
    attributes: ['userAddress', 'data'],
    where: {
      chain: network,
      tokenAddress: address,
      userAddress: {
        [Op.in]: keyHolders,
      },
    },
  })
}

// get latest lock migration record from DB
export async function getLockMigration(lockAddress: string, chain: number) {
  return LockMigrations.findOne({
    where: { lockAddress, chain },
    order: [['createdAt', 'DESC']],
  })
}

export async function updateLockMigrationsLog(
  lockMigrationId: number,
  log: string
) {
  LockMigrations.update(
    {
      logs: fn('CONCAT', col('logs'), '\n', log),
    },
    {
      where: {
        id: lockMigrationId,
      },
    }
  )
}
