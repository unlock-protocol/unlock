import reducer from '../../reducers/accountReducer'
import { SET_ACCOUNT } from '../../actions/accounts'

describe('account reducer', () => {

  const account = '0xabc'

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({})
  })

  it('should set the account accordingly when receiving SET_ACCOUNT', () => {
    expect(reducer(undefined, {
      type: SET_ACCOUNT,
      account,
    })).toEqual(account)
  })

})
