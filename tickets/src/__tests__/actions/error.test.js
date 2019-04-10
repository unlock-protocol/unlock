import {
  setError,
  SET_ERROR,
  RESET_ERROR,
  resetError,
} from '../../actions/error'

const MY_ERROR = 'MY ERROR'

describe('error actions', () => {
  it('should create an action to set the error', () => {
    expect.assertions(1)
    const error = MY_ERROR
    const data = {}
    const expectedAction = {
      type: SET_ERROR,
      error,
      data,
    }

    expect(setError(error)).toEqual(expectedAction)
  })

  it('should create an action to reset all errors', () => {
    expect.assertions(1)
    const error = null
    const expectedAction = {
      type: SET_ERROR,
      error,
      data: {},
    }

    expect(setError(error)).toEqual(expectedAction)
  })

  it('should create an action to reset a single error', () => {
    expect.assertions(1)
    const error = MY_ERROR
    const expectedAction = {
      type: RESET_ERROR,
      error,
    }

    expect(resetError(error)).toEqual(expectedAction)
  })
})
