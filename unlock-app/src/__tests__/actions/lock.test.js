import {
  addLock,
  createLock,
  deleteLock,
  updateLock,
  withdrawFromLock,
  updateKeyPrice,
  CREATE_LOCK,
  ADD_LOCK,
  DELETE_LOCK,
  UPDATE_LOCK,
  WITHDRAW_FROM_LOCK,
  UPDATE_LOCK_KEY_PRICE,
} from '../../actions/lock'

describe('lock actions', () => {
  it('should create an action to create a lock', () => {
    expect.assertions(1)
    const lock = {}
    const expectedAction = {
      type: CREATE_LOCK,
      lock,
    }
    expect(createLock(lock)).toEqual(expectedAction)
  })

  it('should create an action to update the lock', () => {
    expect.assertions(1)
    const address = '0x1234'
    const update = {}
    const expectedAction = {
      type: UPDATE_LOCK,
      address,
      update,
    }
    expect(updateLock(address, update)).toEqual(expectedAction)
  })

  it('should create an action to add the lock', () => {
    expect.assertions(1)
    const lock = {}
    const address = '0x123'
    const expectedAction = {
      type: ADD_LOCK,
      address,
      lock,
    }
    expect(addLock(address, lock)).toEqual(expectedAction)
  })

  it('should create an action to delete a lock', () => {
    expect.assertions(1)
    const address = '0x123'
    const expectedAction = {
      type: DELETE_LOCK,
      address,
    }
    expect(deleteLock(address)).toEqual(expectedAction)
  })

  it('should create an action to withdraw from the lock', () => {
    expect.assertions(1)
    const lock = {}
    const expectedAction = {
      type: WITHDRAW_FROM_LOCK,
      lock,
    }
    expect(withdrawFromLock(lock)).toEqual(expectedAction)
  })

  it('should create an action to update the key price', () => {
    expect.assertions(1)
    const address = '0x123'
    const price = '0.02'
    const expectedAction = {
      type: UPDATE_LOCK_KEY_PRICE,
      address,
      price,
    }

    expect(updateKeyPrice(address, price)).toEqual(expectedAction)
  })
})
