import { setNetwork, SET_NETWORK } from '../../actions/network'

describe('network actions', () => {
  it('should create an action to set the network', () => {
    expect.assertions(1)
    const network = 'dev'
    const expectedAction = {
      type: SET_NETWORK,
      network,
    }
    expect(setNetwork(network)).toEqual(expectedAction)
  })
})
