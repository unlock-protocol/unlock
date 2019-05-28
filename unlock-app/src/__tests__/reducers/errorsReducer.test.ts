import reducer, { initialState } from '../../reducers/errorsReducer'
import { setError, resetError, clearAllErrors } from '../../actions/error'
import Error from '../../utils/Error'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import { SET_ACCOUNT } from '../../actions/accounts'

describe('errors reducer', () => {
  const action = setError(Error.Storage.Warning('Bees in the datacenter.'))
  const error = action.error
  const action2 = setError(Error.Storage.Fatal('BEES IN THE DATACENTER!!!'))
  const error2 = action2.error

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

  it('should return the initial state when receiving SET_ACCOUNT', () => {
    expect.assertions(1)
    expect(
      reducer([error], {
        type: SET_ACCOUNT,
      })
    ).toBe(initialState)
  })

  it('should set the error accordingly when receiving SET_ERROR', () => {
    expect.assertions(1)
    expect(reducer(undefined, action)).toEqual([
      Error.Storage.Warning('Bees in the datacenter.'),
    ])
  })

  it('should add another error when receiving SET_ERROR again', () => {
    expect.assertions(1)
    expect(reducer([error], action2)).toEqual([error, error2])
  })

  it('should not set the same error twice', () => {
    expect.assertions(1)
    expect(reducer([error], action)).toEqual([error])
  })

  it('should not change state if RESET_ERROR with non-existing error is called', () => {
    expect.assertions(1)
    const state = [error]
    expect(reducer(state, resetError(error2))).toBe(state)
  })

  it('should reset all errors if CLEAR_ALL_ERRORS with no specific error received', () => {
    expect.assertions(1)
    expect(reducer([error, error2], clearAllErrors())).toBe(initialState)
  })

  it('should reset a specific error if RESET_ERROR is called with a specific error', () => {
    expect.assertions(2)
    const state = [error, error2]
    expect(reducer(state, resetError(error))).toEqual([error2])
    expect(reducer(state, resetError(error2))).toEqual([error])
  })
})
