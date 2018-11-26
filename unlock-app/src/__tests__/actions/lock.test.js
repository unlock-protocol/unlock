import {
  createLock,
  setLock,
  updateLock,
  withdrawFromLock,
  lockDeployed,
  CREATE_LOCK,
  SET_LOCK,
  UPDATE_LOCK,
  WITHDRAW_FROM_LOCK,
  LOCK_DEPLOYED,
} from '../../actions/lock'

describe('lock actions', () => {
  it('should create an action to create a lock', () => {
    const lock = {}
    const expectedAction = {
      type: CREATE_LOCK,
      lock,
    }
    expect(createLock(lock)).toEqual(expectedAction)
  })

  it('should create an action to reset the lock', () => {
    const address = '0x1234'
    const update = {}
    const expectedAction = {
      type: UPDATE_LOCK,
      address,
      update,
    }
    expect(updateLock(address, update)).toEqual(expectedAction)
  })

  it('should create an action to set the lock', () => {
    const lock = {}
    const expectedAction = {
      type: SET_LOCK,
      lock,
    }
    expect(setLock(lock)).toEqual(expectedAction)
  })

  it('should create an action to withdraw from the lock', () => {
    const lock = {}
    const expectedAction = {
      type: WITHDRAW_FROM_LOCK,
      lock,
    }
    expect(withdrawFromLock(lock)).toEqual(expectedAction)
  })

  it('should create an action to indicate that a lock has been deployed', () => {
    const lock = {}
    const address = '0x1234'
    const expectedAction = {
      type: LOCK_DEPLOYED,
      lock,
      address,
    }
    expect(lockDeployed(lock, address)).toEqual(expectedAction)
  })
})
