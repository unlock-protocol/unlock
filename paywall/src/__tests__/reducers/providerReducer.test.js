import reducer from '../../reducers/providerReducer'
import { SET_PROVIDER } from '../../actions/provider'

describe('provider reducer', () => {
  const provider = 'WebSocket'

  it('should return the initial state as null if there are no reducers', () => {
    /**
     * It is important that the default state is null and not undefined per this Redux error:
     * Error: Reducer "provider" returned undefined during initialization.If the state passed
     * to the reducer is undefined, you must explicitly return the initial state.The initial
     * state may not be undefined.If you don't want to set a value for this reducer, you can
     * use null instead of undefined.
     */
    expect(reducer(null, {})).toEqual(null)
  })

  it('should set the provider accordingly when receiving SET_PROVIDER', () => {
    expect(
      reducer(undefined, {
        type: SET_PROVIDER,
        provider,
      })
    ).toEqual(provider)
  })
})
