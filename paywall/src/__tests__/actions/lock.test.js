import {
  addLock,
  deleteLock,
  updateLock,
  ADD_LOCK,
  DELETE_LOCK,
  UPDATE_LOCK,
} from '../../actions/lock'

describe('lock actions', () => {
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
})
