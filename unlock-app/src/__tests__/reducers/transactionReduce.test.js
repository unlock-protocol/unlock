import reducer from '../../reducers/transactionReducer'
import { SET_TRANSACTION, UPDATE_TRANSACTION } from '../../actions/transaction'

describe('transaction reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({all: {}, lastUpdated: 0, latest: null})
  })

  describe('when receiving SET_TRANSACTION', () => {

    it('should set the transaction accordingly', () => {
      const transactions = {
        all: {},
        lastUpdated: 0,
        latest: {
          status: 'pending',
          confirmations: 0,
          createdAt: new Date().getTime(),
        },
      }

      expect(reducer(undefined, {
        type: SET_TRANSACTION,
        transactions,
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

      const updatedTransaction = Object.assign({}, transaction)
      updatedTransaction.status = 'mined'

      expect(reducer(transaction, {
        type: UPDATE_TRANSACTION,
        transaction: updatedTransaction,
      }).status).toEqual('mined')
    })

    it('should not update the transaction if the previous one is different', () => {
      const transaction = {
        status: 'pending',
        confirmations: 0,
        createdAt: new Date().getTime(),
      }

      const updatedTransaction = Object.assign({}, transaction)
      updatedTransaction.status = 'mined'
      updatedTransaction.createdAt = transaction.createdAt + 100

      expect(reducer(transaction, {
        type: UPDATE_TRANSACTION,
        transaction: updatedTransaction,
      }).status).toEqual('pending')
    })
  })

})
