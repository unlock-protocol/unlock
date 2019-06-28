import { Transaction } from '../models/transaction'

const ethJsUtil = require('ethereumjs-util')
const Sequelize = require('sequelize')

const Op = Sequelize.Op

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
// export const getTransactionsBySender = async (_sender: string, filter: any) => {
export const getTransactionsBySender = async (filter: any) => {
  return await Transaction.findAll({
    where: queryFilter(filter),
  })
}

const queryFilter = (filter: any) => {
  const sender = ethJsUtil.toChecksumAddress(filter.sender)

  var target: any = {}
  target.sender = { [Op.eq]: sender }

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

  return target
}
