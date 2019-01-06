import { setError, SET_ERROR } from '../../actions/error'

describe('error actions', () => {
  it('should create an action to set the error', () => {
    const error = {
      message: 'This is not right',
    }
    const expectedAction = {
      type: SET_ERROR,
      error,
    }

    expect(setError(error)).toEqual(expectedAction)
  })

  it('should format an error message correctly if passed as a string', () => {
    const error = 'This is not right'
    const expectedAction = {
      type: SET_ERROR,
      error: {
        message: error,
      },
    }

    expect(setError(error)).toEqual(expectedAction)
  })
})
