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

module.exports = { transactionCreate, transactionsGet }
