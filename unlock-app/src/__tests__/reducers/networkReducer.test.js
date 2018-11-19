import reducer from '../../reducers/networkReducer'
import { SET_NETWORK } from '../../actions/network'

describe('network reducer', () => {
  const network = 'dev'

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      name: 0,
    })
  })

  it('should set the network accordingly when receiving SET_NETWORK', () => {
    expect(
      reducer(undefined, {
        type: SET_NETWORK,
        network,
      })
    ).toEqual({ name: network })
  })
})
