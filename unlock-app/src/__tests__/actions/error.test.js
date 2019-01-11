import {
  setError,
  SET_ERROR,
  RESET_ERROR,
  resetError,
  metadataError,
  WEB3_ERROR,
  web3Error,
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

  it('metadataError', () => {
    const expectedAction = {
      type: 'hi',
      error: {
        metadata: 'there',
        type: 'hi',
      },
    }
    expect(metadataError('there', 'hi')).toEqual(expectedAction)
  })

  it('web3Error', () => {
    const expectedAction = {
      type: WEB3_ERROR,
      error: {
        metadata: {
          originalError: {
            message: 'hi',
          },
        },
        type: WEB3_ERROR,
      },
    }
    expect(web3Error({ message: 'hi' })).toEqual(expectedAction)
  })
})
