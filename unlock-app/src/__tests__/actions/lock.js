import { createLock, setLock, resetLock, CREATE_LOCK, SET_LOCK, RESET_LOCK } from '../../actions/lock'

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
    const lock = {}
    const expectedAction = {
      type: RESET_LOCK,
      lock,
    }
    expect(resetLock(lock)).toEqual(expectedAction)
  })

  it('should create an action to set the lock', () => {
    const lock = {}
    const expectedAction = {
      type: SET_LOCK,
      lock,
    }
    expect(setLock(lock)).toEqual(expectedAction)
  })
})
