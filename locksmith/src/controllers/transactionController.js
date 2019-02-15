const Sequelize = require('sequelize')
const ethJsUtil = require('ethereumjs-util')
const Transaction = require('../transaction')

const Op = Sequelize.Op

const transaction_creation = async (req, res) => {
  let transaction = req.body

  if (
    transaction.transactionHash &&
    transaction.sender &&
    transaction.recipient
  ) {
    try {
      await Transaction.findOrCreate({
        where: {
          transactionHash: transaction.transactionHash,
        },
        defaults: {
          transactionHash: transaction.transactionHash,
          sender: ethJsUtil.toChecksumAddress(transaction.sender),
          recipient: ethJsUtil.toChecksumAddress(transaction.recipient),
        },
      })
      res.sendStatus(202)
    } catch (e) {
      res.sendStatus(400)
    }
  }
}

const transaction_get = async (req, res) => {
  const sender = ethJsUtil.toChecksumAddress(req.query.sender)

  let transactions = await Transaction.findAll({
    where: {
      sender: { [Op.eq]: sender },
    },
  })

  res.json({ transactions: transactions })
}

module.exports = { transaction_creation, transaction_get }
