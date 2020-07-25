const transactionOperations = require('../operations/transactionOperations')

const {
  findOrCreateTransaction,
  getTransactionsByFilter,
} = transactionOperations

const transactionCreate = async (req, res) => {
  const transaction = req.body

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

const transactionCreateLinkdrop = async (req, res) => {
  const transaction = req.body

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

  const filter = buildFilter(req)

  if (filter.sender || filter.recipients || filter.for) {
    transactions = await getTransactionsByFilter(filter)
  }

  res.json({ transactions })
}

const buildFilter = (req) => {
  const filter = {}

  if (req.query.sender) {
    filter.sender = req.query.sender
  }

  if (req.query.recipient) {
    filter.recipient = req.query.recipient
  }

  if (req.query.for) {
    filter.for = req.query.for
  }

  if (req.query.createdAfter) {
    filter.createdAfter = req.query.createdAfter
  }

  return filter
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

module.exports = {
  transactionCreate,
  transactionsGet,
  transactionGetOdds,
  transactionCreateLinkdrop,
}
