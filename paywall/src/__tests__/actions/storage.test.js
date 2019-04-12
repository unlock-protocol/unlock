import { storageError, STORAGE_ERROR } from '../../actions/storage'

describe('Storage error', () => {
  it('should create an action emitting a storage error', () => {
    expect.assertions(1)
    const error = 'a fancy error'

    const expectation = {
      type: STORAGE_ERROR,
      error: error,
    }

    expect(storageError(error)).toEqual(expectation)
  })
})
