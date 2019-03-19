const ethJsUtil = require('ethereumjs-util')
const Sequelize = require('sequelize')
const models = require('../models')

const Op = Sequelize.Op
const { Transaction } = models

/**
 * Finds a transaction by its hash or creates it
 * @param {*} transaction
 */
const findOrCreateTransaction = async transaction => {
  return await Transaction.findOrCreate({
    where: {
      transactionHash: transaction.transactionHash,
    },
    defaults: {
      transactionHash: transaction.transactionHash,
      sender: ethJsUtil.toChecksumAddress(transaction.sender),
      recipient: ethJsUtil.toChecksumAddress(transaction.recipient),
    },
  })
}

/**
 * get all the transactions sent by a given address
 * @param {*} _sender
 */
const getTransactionsBySender = async _sender => {
  const sender = ethJsUtil.toChecksumAddress(_sender)
  return await Transaction.findAll({
    where: {
      sender: { [Op.eq]: sender },
    },
  })
}

module.exports = {
  findOrCreateTransaction,
  getTransactionsBySender,
}
