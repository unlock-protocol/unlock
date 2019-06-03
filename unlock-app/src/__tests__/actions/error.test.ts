import {
  setError,
  SET_ERROR,
  RESET_ERROR,
  resetError,
  CLEAR_ALL_ERRORS,
  clearAllErrors,
} from '../../actions/error'

import Error from '../../utils/Error'

const error = Error.Storage.Fatal('Disk too fragmented')

describe('error actions', () => {
  it('should create an action to set the error', () => {
    expect.assertions(1)
    const expectedAction = {
      type: SET_ERROR,
      error,
    }

    expect(setError(error)).toEqual(expectedAction)
  })

  it('should create an action to reset all errors', () => {
    expect.assertions(1)
    const expectedAction = {
      type: CLEAR_ALL_ERRORS,
    }

    expect(clearAllErrors()).toEqual(expectedAction)
  })

  it('should create an action to reset a single error', () => {
    expect.assertions(1)
    const expectedAction = {
      type: RESET_ERROR,
      error,
    }

    expect(resetError(error)).toEqual(expectedAction)
  })
})
