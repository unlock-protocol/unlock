import reducer from '../../reducers/accountReducer'
import { SET_ACCOUNT, UPDATE_ACCOUNT } from '../../actions/accounts'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'

describe('account reducer', () => {
  const account = {
    address: '0xdeadbeaf',
    balance: '0',
  }

  it('should return the initial state', () => {
    expect.assertions(1)
    expect(reducer(undefined, {})).toEqual(null)
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
    expect.assertions(1)
    expect(
      reducer(account, {
        type: SET_PROVIDER,
      })
    ).toEqual(null)
  })

  it('should return the initial state when receveing SET_NETWORK', () => {
    expect.assertions(1)
    expect(
      reducer(account, {
        type: SET_NETWORK,
      })
    ).toEqual(null)
  })

  it('should set the account accordingly when receiving SET_ACCOUNT', () => {
    expect.assertions(1)
    expect(
      reducer(undefined, {
        type: SET_ACCOUNT,
        account,
      })
    ).toEqual(account)
  })

  it('should update an account accordingly when receiving UPDATE_ACCOUNT', () => {
    expect.assertions(1)
    const update = {
      balance: '1337',
    }
    expect(
      reducer(account, {
        type: UPDATE_ACCOUNT,
        update,
      })
    ).toEqual({
      address: account.address,
      balance: '1337',
    })
  })
})
