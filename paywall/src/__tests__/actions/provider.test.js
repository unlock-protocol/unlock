import { setProvider, SET_PROVIDER } from '../../actions/provider'

describe('provider actions', () => {
  it('should create an action to set the provider', () => {
    const provider = 'dev'
    const expectedAction = {
      type: SET_PROVIDER,
      provider,
    }
    expect(setProvider(provider)).toEqual(expectedAction)
  })
})
