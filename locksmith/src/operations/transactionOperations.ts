import { Transaction } from '../models/transaction'

const ethJsUtil = require('ethereumjs-util')
const Sequelize = require('sequelize')

const { Op } = Sequelize

/**
 * Finds a transaction by its hash or creates it
 * @param {*} transaction
 */
export const findOrCreateTransaction = async (transaction: Transaction) => {
  return await Transaction.findOrCreate({
    where: {
      transactionHash: transaction.transactionHash,
    },
    defaults: {
      transactionHash: transaction.transactionHash,
      sender: ethJsUtil.toChecksumAddress(transaction.sender),
      recipient: ethJsUtil.toChecksumAddress(transaction.recipient),
      for: transactionForPackaging(transaction.for),
      chain: transaction.chain,
      data: transaction.data,
    },
  })
}

const transactionForPackaging = (transactionFor: string) => {
  return transactionFor ? ethJsUtil.toChecksumAddress(transactionFor) : null
}

/**
 * get all the transactions sent by a given address
 * @param {*} _sender
 */
export const getTransactionsByFilter = async (filter: any) => {
  return await Transaction.findAll({
    where: queryFilter(filter),
  })
}

const queryFilter = (filter: any) => {
  const target: any = {}

  if (filter.recipient) {
    target.recipient = {
      [Op.in]: filter.recipient.map((recipient: string) =>
        ethJsUtil.toChecksumAddress(recipient)
      ),
    }
  }

  if (filter.for) {
    target.for = { [Op.eq]: ethJsUtil.toChecksumAddress(filter.for) }
  }

  if (filter.sender) {
    target.sender = { [Op.eq]: ethJsUtil.toChecksumAddress(filter.sender) }
  }

  // createdAfter is a timestamp in microseconds Time. (new Date().getTime())
  if (filter.createdAfter) {
    target.createdAt = { [Op.gte]: new Date(parseInt(filter.createdAfter)) }
  }

  return target
}
