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
    expect(reducer(undefined, action)).toEqual([
      {
        name: error,
        data: {},
      },
    ])
  })

  it('should add another error when receiving SET_ERROR again', () => {
    expect.assertions(1)
    expect(
      reducer(
        [
          {
            name: error,
            data: {},
          },
        ],
        action2
      )
    ).toEqual([
      {
        name: error,
        data: {},
      },
      {
        name: error2,
        data: {},
      },
    ])
  })

  it('should not set the same error twice', () => {
    expect.assertions(1)
    expect(
      reducer(
        [
          {
            name: error,
            data: {},
          },
        ],
        action
      )
    ).toEqual([
      {
        name: error,
        data: {},
      },
    ])
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
    expect.assertions(4)
    const state = [{ name: 1, data: {} }, { name: 2, data: {} }]
    expect(reducer(state, resetError(1))).toEqual([{ name: 2, data: {} }])
    expect(reducer(state, resetError(2))).toEqual([{ name: 1, data: {} }])
    expect(reducer(state, resetError(2))).toEqual([{ name: 1, data: {} }])
    expect(reducer(state, resetError(3))).toEqual(state)
  })
})
