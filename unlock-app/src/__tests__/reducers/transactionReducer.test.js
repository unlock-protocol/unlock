import reducer from '../../reducers/transactionReducer'
import { SET_TRANSACTION, UPDATE_TRANSACTION, DELETE_TRANSACTION } from '../../actions/transaction'

describe('transaction reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({all: {}, lastUpdated: 0, latest: null})
  })

  describe('when receiving SET_TRANSACTION', () => {

    it('should set the transaction accordingly', () => {
      const transaction = {
        status: 'pending',
        confirmations: 0,
        createdAt: new Date().getTime(),
      }

      const transactions = {
        all: {},
        lastUpdated: 0,
        latest: transaction,
      }

      expect(reducer(undefined, {
        type: SET_TRANSACTION,
        transaction,
      })).toEqual(transactions)
    })

    it('should unset the transaction with no transaction', () => {
      let transactions = reducer(undefined, {
        type: SET_TRANSACTION,
      })
      expect(transactions.latest).toEqual(null)
    })
  })

  describe('when receiving UPDATE_TRANSACTION', () => {

    it('should update the transaction if the previous one is the same', () => {
      const transaction = {
        status: 'pending',
        confirmations: 0,
        createdAt: new Date().getTime(),
      }

      const transactions = {
        all: {},
        lastUpdated: 0,
        latest: transaction,
      }

      const updatedTransaction = Object.assign({}, transaction)
      updatedTransaction.status = 'mined'

      let transactionsResponse = reducer(transactions, {
        type: UPDATE_TRANSACTION,
        transaction: updatedTransaction,
      })

      expect(transactionsResponse.latest.status).toEqual('mined')
    })

    it('should not update the transaction if the previous one is different', () => {
      const transaction = {
        status: 'pending',
        confirmations: 0,
        createdAt: new Date().getTime(),
      }

      const transactions = {
        all: {},
        lastUpdated: 0,
        latest: transaction,
      }

      const updatedTransaction = Object.assign({}, transaction)
      updatedTransaction.status = 'mined'
      updatedTransaction.createdAt = transaction.createdAt + 100

      let transactionsResponse = reducer(transactions, {
        type: UPDATE_TRANSACTION,
        transaction: updatedTransaction,
      })

      expect(transactionsResponse.latest.status).toEqual('pending')
    })

    it('should not update latest transaction if new transaction was created earlier', () => {
      const transaction = {
        status: 'pending',
        confirmations: 0,
        createdAt: new Date().getTime(),
      }

      const transactions = {
        all: {},
        lastUpdated: 0,
        latest: transaction,
      }

      const updatedTransaction = Object.assign({}, transaction)
      updatedTransaction.status = 'mined'
      updatedTransaction.createdAt = transaction.createdAt - 100

      let transactionsResponse = reducer(transactions, {
        type: UPDATE_TRANSACTION,
        transaction: updatedTransaction,
      })

      expect(transactionsResponse.latest.status).toEqual('pending')
    })
  })

  describe('when receiving DELETE_TRANSACTION', () => {
    it('should remove the transaction which has been deleted from the list of all transactions', () => {
      const transaction = {
        hash: '123',
        status: 'pending',
        confirmations: 0,
        createdAt: new Date().getTime(),
      }

      const transactions = {
        all: {
          [transaction.hash]: transaction,
        },
        lastUpdated: 0,
        latest: transaction,
      }

      let newState = reducer(transactions, {
        type: DELETE_TRANSACTION,
        transaction,
      })

      expect(newState.all).toEqual({})
      expect(newState.latest).toEqual(null)
    })

    it('should keep the transactions when another one has been deleted', () => {
      const transaction = {
        hash: '123',
        status: 'pending',
        confirmations: 0,
        createdAt: new Date().getTime(),
      }

      const transactionToKeep = {
        hash: '456',
        status: 'pending',
        confirmations: 0,
        createdAt: new Date().getTime(),
      }

      const transactions = {
        all: {
          [transaction.hash]: transaction,
          [transactionToKeep.hash]: transactionToKeep,
        },
        lastUpdated: 0,
        latest: transactionToKeep,
      }

      let newState = reducer(transactions, {
        type: DELETE_TRANSACTION,
        transaction,
      })

      expect(newState.all).toEqual({
        [transactionToKeep.hash]: transactionToKeep,
      })
      expect(newState.latest).toEqual(transactionToKeep)
    })
  })

})
