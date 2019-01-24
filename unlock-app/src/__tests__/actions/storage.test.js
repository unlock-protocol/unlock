import {
  setLockName,
  storageError,
  SET_LOCK_NAME,
  STORAGE_ERROR,
  storeLockCreation,
  storeLockUpdate,
  STORE_LOCK_CREATION,
  STORE_LOCK_UPDATE,
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

describe('Store Lock Creation', () => {
  it('should create an action indicating storage of a newly created lock', () => {
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

describe('Store Lock Update', () => {
  it('should create an action indicating update of a lock', () => {
    const owner = "An owner's address"
    const currentLock = 'The current lock address'
    const token = 'An authorization token'
    const update = 'A new lock address'

    const expectation = {
      type: STORE_LOCK_UPDATE,
      owner: owner,
      lockAddress: currentLock,
      token: token,
      update: update,
    }

    expect(storeLockUpdate(owner, currentLock, token, update)).toEqual(
      expectation
    )
  })
})
