import { ethers } from 'ethers'
import { Transaction } from '../models/transaction'

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
      sender: ethers.utils.getAddress(transaction.sender),
      recipient: ethers.utils.getAddress(transaction.recipient),
      for: transactionForPackaging(transaction.for),
      chain: transaction.chain,
      data: transaction.data,
    },
  })
}

const transactionForPackaging = (transactionFor: string) => {
  return transactionFor ? ethers.utils.getAddress(transactionFor) : null
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
        ethers.utils.getAddress(recipient)
      ),
    }
  }

  if (filter.for) {
    target.for = { [Op.eq]: ethers.utils.getAddress(filter.for) }
  }

  if (filter.sender) {
    target.sender = { [Op.eq]: ethers.utils.getAddress(filter.sender) }
  }

  // createdAfter is a timestamp in microseconds Time. (new Date().getTime())
  if (filter.createdAfter) {
    target.createdAt = { [Op.gte]: new Date(parseInt(filter.createdAfter)) }
  }

  return target
}
