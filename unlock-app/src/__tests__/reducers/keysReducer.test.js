import reducer from '../../reducers/keysReducer'
import { ADD_KEY } from '../../actions/key'

describe('keys reducer', () => {

  const key = {
    id: 'keyId',
    expiration: 0,
    data: 'hello',
  }

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
    })
  })

  it('should add the key by its id accordingly when receiving ADD_KEY', () => {
    expect(reducer({}, {
      type: ADD_KEY,
      key,
    })).toEqual({
      [key.id]: key,
    })
  })

})
