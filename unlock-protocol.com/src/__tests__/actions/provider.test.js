import { setProvider, SET_PROVIDER } from '../../actions/provider'

describe('provider actions', () => {
  it('should create an action to set the provider', () => {
    expect.assertions(1)
    const provider = 'dev'
    const expectedAction = {
      type: SET_PROVIDER,
      provider,
    }
    expect(setProvider(provider)).toEqual(expectedAction)
  })
})
