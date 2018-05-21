import reducer from '../../reducers/accountReducer'
import { SET_ACCOUNT, RESET_ACCOUNT_BALANCE } from '../../actions/accounts'

describe('account reducer', () => {

  const account = {
    address: '0xdeadbeaf',
    balance: 0,
  }
  const balance = '1337'

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({ 'locks': [] })
  })

  it('should set the account accordingly when receiving SET_ACCOUNT', () => {
    expect(reducer(undefined, {
      type: SET_ACCOUNT,
      account,
    })).toEqual(account)
  })

  it('should update the balance of an account accordingly when receiving SET_ACCOUNT', () => {
    expect(reducer(account, {
      type: RESET_ACCOUNT_BALANCE,
      balance,
    })).toEqual({
      address: account.address,
      balance,
    })
  })

})
