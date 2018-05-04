import reducer from '../../reducers/keyReducer'
import { SET_KEY } from '../../actions/key'
import { SET_ACCOUNT } from '../../actions/accounts'

describe('key reducer', () => {

  const key = {
    expiration: 0,
    data: 'hello',
  }

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      expiration: 0,
      data: '',
    })
  })

  it('should set the key accordingly when receiving SET_KEY', () => {
    expect(reducer(undefined, {
      type: SET_KEY,
      key,
    })).toEqual(key)
  })

  it('should reset the key accordingly when receiving SET_ACCOUNT', () => {
    const account = {}
    expect(reducer(undefined, {
      type: SET_ACCOUNT,
      account,
    })).toEqual({
      expiration: 0,
      data: '',
    })
  })

})
