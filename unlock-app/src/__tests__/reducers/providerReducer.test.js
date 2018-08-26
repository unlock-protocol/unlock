import reducer from '../../reducers/providerReducer'
import { SET_PROVIDER } from '../../actions/provider'

describe('provider reducer', () => {

  const provider = 'WebSocket'

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual('HTTP')
  })

  it('should set the provider accordingly when receiving SET_PROVIDER', () => {
    expect(reducer(undefined, {
      type: SET_PROVIDER,
      provider,
    })).toEqual(provider)
  })

})
