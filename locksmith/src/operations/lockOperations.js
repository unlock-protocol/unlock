const ethJsUtil = require('ethereumjs-util')
const Sequelize = require('sequelize')
const models = require('../models')

const Op = Sequelize.Op
const { Lock } = models

/**
 * Creates a lock. Normalizes addresses before saving.
 * @param {*} lock
 */
const createLock = async lock => {
  return await Lock.create({
    address: ethJsUtil.toChecksumAddress(lock.address),
    owner: ethJsUtil.toChecksumAddress(lock.owner),
  })
}

/**
 * Get a lockj by its address
 * @param {*} address
 */
const getLockByAddress = async address => {
  return await Lock.findOne({
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
const getLocksByOwner = async owner => {
  return await Lock.findAll({
    attributes: Lock.publicFields,
    where: {
      owner: { [Op.eq]: ethJsUtil.toChecksumAddress(owner) },
    },
  })
}

const getLockAddresses = async () => {
  let lockAddresses = await Lock.findAll({ attributes: ['address'] })
  return lockAddresses.map(lockAddress => lockAddress.address)
}

const updateLockOwnership = async (address, owner) => {
  return Lock.upsert(
    {
      address: ethJsUtil.toChecksumAddress(address),
      owner: ethJsUtil.toChecksumAddress(owner),
    },
    {
      fields: ['owner'],
    }
  )
}

module.exports = {
  createLock,
  getLocksByOwner,
  getLockByAddress,
  getLockAddresses,
  updateLockOwnership,
}
