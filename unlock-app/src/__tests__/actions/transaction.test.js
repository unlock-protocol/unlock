import { setTransaction, SET_TRANSACTION } from '../../actions/transaction'

describe('transaction actions', () => {

  it('should create an action to set the transaction', () => {
    const transaction = {

    }
    const expectedAction = {
      type: SET_TRANSACTION,
      transaction,
    }
    expect(setTransaction(transaction)).toEqual(expectedAction)
  })

})
