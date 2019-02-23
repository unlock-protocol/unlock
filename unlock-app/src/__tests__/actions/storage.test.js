import {
  storageError,
  STORAGE_ERROR,
  storeLockCreation,
  STORE_LOCK_CREATION,
} from '../../actions/storage'

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

describe('Store Lock Creation', () => {
  it('should create an action indicating storage of a newly created lock', () => {
    expect.assertions(1)
    const owner = "An owner's address"
    const lock = {}
    const token = 'An authorization token'

    const expectation = {
      type: STORE_LOCK_CREATION,
      owner: owner,
      lock: lock,
      token: token,
    }

    expect(storeLockCreation(owner, lock, token)).toEqual(expectation)
  })
})
