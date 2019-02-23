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
    expect.assertions(1)
    expect(reducer(undefined, {})).toBe(initialState)
  })

  it('should return the initial state when receiving SET_PROVIDER', () => {
    expect.assertions(1)
    expect(
      reducer([error], {
        type: SET_PROVIDER,
      })
    ).toBe(initialState)
  })

  it('should return the initial state when receiving SET_NETWORK', () => {
    expect.assertions(1)
    expect(
      reducer([error], {
        type: SET_NETWORK,
      })
    ).toBe(initialState)
  })

  it('should set the error accordingly when receiving SET_ERROR', () => {
    expect.assertions(1)
    expect(reducer(undefined, action)).toEqual([error])
  })

  it('should set add an error when receiving SET_ERROR again', () => {
    expect.assertions(1)
    expect(reducer([error], action2)).toEqual([error, error2])
  })

  it('should not set the same error twice', () => {
    expect.assertions(1)
    expect(reducer([error], action)).toEqual([error])
  })

  it('should not change state if RESET_ERROR with non-existing error is called', () => {
    expect.assertions(1)
    const state = ['some other error']
    expect(reducer(state, resetError('non-existing'))).toBe(state)
  })

  it('should reset all errors if RESET_ERROR with no specific error received', () => {
    expect.assertions(1)
    expect(reducer([1, 2], resetError())).toBe(initialState)
  })

  it('should reset a specific error if RESET_ERROR is called with a specific error', () => {
    expect.assertions(3)
    expect(reducer([1, 2], resetError(1))).toEqual([2])
    expect(reducer([1, 2], resetError(2))).toEqual([1])
    expect(reducer([1, 2], resetError(3))).toEqual([1, 2])
  })
})
