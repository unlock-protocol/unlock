import Sequelize = require('sequelize')
import { ethers } from 'ethers'
import networks from '@unlock-protocol/networks'
import * as Normalizer from '../utils/normalizer'
import { Web3Service } from '@unlock-protocol/unlock-js'

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
    address: ethers.utils.getAddress(lock.address),
    owner: ethers.utils.getAddress(lock.owner),
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
      address: { [Op.eq]: ethers.utils.getAddress(address) },
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
      owner: { [Op.eq]: ethers.utils.getAddress(owner) },
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
      address: ethers.utils.getAddress(address),
      owner: ethers.utils.getAddress(owner),
    },
    {
      fields: ['owner'],
    }
  )
}

export async function getKeyHolderMetadata(
  address: string,
  keyHolders: string[],
  network: number
) {
  const userTokenMetadata = await UserTokenMetadata.findAll({
    attributes: ['userAddress', 'data'],
    where: {
      chain: network,
      tokenAddress: address,
      userAddress: {
        [Op.in]: keyHolders.map((address) =>
          Normalizer.ethereumAddress(address)
        ),
      },
    },
  })
  return userTokenMetadata
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

export async function isSoldOut(
  address: string,
  chain: number,
  keysNeeded = 10
): Promise<boolean> {
  const web3Service = new Web3Service(networks)

  const keysAvailable = await web3Service.keysAvailable(address, chain)
  return keysAvailable.lte(keysNeeded) // true of keysAvailable smaller than keysNeeded
}
