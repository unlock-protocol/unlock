import {
  setError,
  SET_ERROR,
  RESET_ERROR,
  resetError,
} from '../../actions/error'

describe('error actions', () => {
  it('should create an action to set the error', () => {
    const error = 'This is not right'
    const context = 'context'
    const expectedAction = {
      type: SET_ERROR,
      error: { error, context },
    }

    expect(setError({ error, context })).toEqual(expectedAction)
  })

  it('should create an action to reset errors', () => {
    const error = { message: 'error', context: 'context' }
    const expectedAction = {
      type: RESET_ERROR,
      error,
    }

    expect(resetError(error)).toEqual(expectedAction)
  })

  it('should create an action with empty error to reset all errors', () => {
    const expectedAction = {
      type: RESET_ERROR,
      error: undefined,
    }
    expect(resetError()).toEqual(expectedAction)
  })
})
