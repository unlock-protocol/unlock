import reducer, { initialState } from '../../reducers/errorReducer'
import { setError, resetError } from '../../actions/error'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'

describe('error reducer', () => {
  const action = setError({ message: 'hi', context: 'there' })
  const error = action.error
  const error2 = setError({ message: 'two', context: 'hi' }).error

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual([])
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
    expect(
      reducer([error], {
        type: SET_PROVIDER,
      })
    ).toEqual([])
  })

  it('should return the initial state when receveing SET_NETWORK', () => {
    expect(
      reducer([error], {
        type: SET_NETWORK,
      })
    ).toEqual([])
  })

  it('should set the error accordingly when receiving SET_ERROR', () => {
    expect(reducer(undefined, action)).toEqual([error])
  })

  it('should reset all errors if RESET_ERROR with no specific error received', () => {
    expect(reducer([1, 2], resetError())).toBe(initialState)
  })

  it('should reset only a specific error if RESET_ERROR is called with that error', () => {
    const startState = [error, error2]

    expect(reducer(startState, resetError(error))).toEqual([error2])
    expect(reducer(startState, resetError(error2))).toEqual([error])
  })
})
