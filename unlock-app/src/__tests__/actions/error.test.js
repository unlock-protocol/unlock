import { setError, SET_ERROR } from '../../actions/error'

const MY_ERROR = 'MY ERROR'

describe('error actions', () => {
  it('should create an action to set the error', () => {
    const error = MY_ERROR
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
