import reducer from '../../reducers/transactionReducer'
import { SET_TRANSACTION } from '../../actions/transaction'

describe('transaction reducer', () => {

  const transaction = {
    status: 'pending',
    confirmations: 0,
    createdAt: new Date().getTime(),
  }

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(null)
  })

  it('should set the network accordingly when receiving SET_NETWORK', () => {
    expect(reducer(undefined, {
      type: SET_TRANSACTION,
      transaction,
    })).toEqual(transaction)
  })

})
