import {
  setProvider,
  SET_PROVIDER,
  PROVIDER_READY,
  providerReady,
} from '../../actions/provider'

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

  it('should create an action to signal the provider is ready', () => {
    expect.assertions(1)
    const expectedAction = {
      type: PROVIDER_READY,
    }

    expect(providerReady()).toEqual(expectedAction)
  })
})
