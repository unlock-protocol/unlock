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

  it('should create an action to reset all errors', () => {
    const error = null
    const expectedAction = {
      type: SET_ERROR,
      error,
    }

    expect(setError(error)).toEqual(expectedAction)
  })
})
