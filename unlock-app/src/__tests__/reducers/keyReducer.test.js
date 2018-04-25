import reducer from '../../reducers/keyReducer'
import { SET_KEY } from '../../actions/key'

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

})
