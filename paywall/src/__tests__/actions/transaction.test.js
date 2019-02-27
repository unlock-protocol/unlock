import {
  addTransaction,
  ADD_TRANSACTION,
  deleteTransaction,
  DELETE_TRANSACTION,
  newTransaction,
  NEW_TRANSACTION,
  updateTransaction,
  UPDATE_TRANSACTION,
} from '../../actions/transaction'

describe('transaction actions', () => {
  it('should create an action to add a transaction', () => {
    expect.assertions(1)
    const transaction = {}
    const expectedAction = {
      type: ADD_TRANSACTION,
      transaction,
    }
    expect(addTransaction(transaction)).toEqual(expectedAction)
  })

  it('should create an action to update the transaction', () => {
    expect.assertions(1)
    const hash = '0x123'
    const update = {}
    const expectedAction = {
      type: UPDATE_TRANSACTION,
      hash,
      update,
    }
    expect(updateTransaction(hash, update)).toEqual(expectedAction)
  })

  it('should create an action to delete a transaction', () => {
    expect.assertions(1)
    const transaction = {}
    const expectedAction = {
      type: DELETE_TRANSACTION,
      transaction,
    }
    expect(deleteTransaction(transaction)).toEqual(expectedAction)
  })

  it('should create an action to add a new transaction', () => {
    expect.assertions(1)
    const transaction = {}
    const expectedAction = {
      type: NEW_TRANSACTION,
      transaction,
    }
    expect(newTransaction(transaction)).toEqual(expectedAction)
  })
})
