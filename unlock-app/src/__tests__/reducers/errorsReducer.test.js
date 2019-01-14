import reducer, { initialState } from '../../reducers/errorsReducer'
import { setError, resetError } from '../../actions/error'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'

describe('errors reducer', () => {
  const action = setError('something was wrong')
  const error = action.error
  const action2 = setError('error 2')
  const error2 = action2.error

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toBe(initialState)
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
    expect(
      reducer([error], {
        type: SET_PROVIDER,
      })
    ).toBe(initialState)
  })

  it('should return the initial state when receveing SET_NETWORK', () => {
    expect(
      reducer([error], {
        type: SET_NETWORK,
      })
    ).toBe(initialState)
  })

  it('should set the error accordingly when receiving SET_ERROR', () => {
    expect(reducer(undefined, action)).toEqual([error])
  })

  it('should set add an error when receiving SET_ERROR again', () => {
    expect(reducer([error], action2)).toEqual([error, error2])
  })

  it('should reset all errors if RESET_ERROR with no specific error received', () => {
    expect(reducer([1, 2], resetError())).toBe(initialState)
  })

  it('should reset a specific error if RESET_ERROR is called with a specific error', () => {
    expect(reducer([1, 2], resetError(1))).toEqual([2])
    expect(reducer([1, 2], resetError(2))).toEqual([1])
    expect(reducer([1, 2], resetError(3))).toEqual([1, 2])
  })
})
