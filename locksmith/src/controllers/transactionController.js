const transactionOperations = require('../operations/transactionOperations')

const {
  findOrCreateTransaction,
  getTransactionsBySender,
} = transactionOperations

const transactionCreate = async (req, res) => {
  let transaction = req.body

  if (
    transaction.transactionHash &&
    transaction.sender &&
    transaction.recipient
  ) {
    try {
      await findOrCreateTransaction(transaction)
      res.sendStatus(202)
    } catch (e) {
      res.sendStatus(400)
    }
  }
}

const transactionsGet = async (req, res) => {
  let transactions = []
  if (req.query.sender) {
    transactions = await getTransactionsBySender(req.query.sender)
  }
  res.json({ transactions: transactions })
}

/**
 * This will retun a JSON object to indicate the likelines that a transaction has to succeed.
 * 0: the transaction will surely fail
 * 1: the transaction will surely succeed
 * TODO: implement logic
 * @param {*} req
 * @param {*} res
 */
const transactionGetOdds = async (req, res) => {
  res.json({ willSucceed: 1 })
}

module.exports = { transactionCreate, transactionsGet, transactionGetOdds }
