import {
  setError,
  SET_ERROR,
  RESET_ERROR,
  resetError,
} from '../../actions/error'

describe('error actions', () => {
  it('should create an action to set the error', () => {
    const error = 'This is not right'
    const expectedAction = {
      type: SET_ERROR,
      error,
    }

    expect(setError(error)).toEqual(expectedAction)
  })

  it('should create an action to reset errors', () => {
    const error = 'error'
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
