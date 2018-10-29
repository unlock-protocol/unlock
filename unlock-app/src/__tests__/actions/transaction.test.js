import { addTransaction, ADD_TRANSACTION, updateTransaction, UPDATE_TRANSACTION, refreshTransaction, REFRESH_TRANSACTION, deleteTransaction, DELETE_TRANSACTION } from '../../actions/transaction'

describe('transaction actions', () => {

  it('should create an action to set the transaction', () => {
    const transaction = {

    }
    const expectedAction = {
      type: ADD_TRANSACTION,
      transaction,
    }
    expect(addTransaction(transaction)).toEqual(expectedAction)
  })

  it('should create an action to update the transaction', () => {
    const transaction = {

    }
    const expectedAction = {
      type: UPDATE_TRANSACTION,
      transaction,
    }
    expect(updateTransaction(transaction)).toEqual(expectedAction)
  })

  it('should create an action to refresh the transaction', () => {
    const transaction = {

    }
    const expectedAction = {
      type: REFRESH_TRANSACTION,
      transaction,
    }
    expect(refreshTransaction(transaction)).toEqual(expectedAction)
  })

  it('should create an action to delete a transaction', () => {
    const transaction = {

    }
    const expectedAction = {
      type: DELETE_TRANSACTION,
      transaction,
    }
    expect(deleteTransaction(transaction)).toEqual(expectedAction)
  })

})
