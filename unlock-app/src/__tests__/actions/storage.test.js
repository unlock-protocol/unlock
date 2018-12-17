import {
  setLockName,
  storageError,
  SET_LOCK_NAME,
  STORAGE_ERROR,
} from '../../actions/storage'

describe('Storage action', () => {
  it('should create an action to set a lock', () => {
    const address = '0x2129127646'
    const name = 'A Lock Name'

    const expectation = {
      type: SET_LOCK_NAME,
      address: address,
      name: name,
    }
    expect(setLockName(address, name)).toEqual(expectation)
  })
})

describe('Storage error', () => {
  it('should create an action emitting a storage error', () => {
    const error = 'a fancy error'

    const expectation = {
      type: STORAGE_ERROR,
      error: error,
    }

    expect(storageError(error)).toEqual(expectation)
  })
})
