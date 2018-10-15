import reducer from '../../reducers/locksReducer'
import { CREATE_LOCK } from '../../actions/lock'
import { SET_ACCOUNT } from '../../actions/accounts'

describe('locks reducer', () => {

  const lock = {
    id: '123',
  }

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({})
  })

  it('should add the lock when receiving CREATE_LOCK and if it was not there yet', () => {
    expect(reducer(undefined, {
      type: CREATE_LOCK,
      lock,
    })).toEqual({
      [lock.id]: lock,
    })
  })

  it('should not add the lock twice even when receiving CREATE_LOCK again', () => {
    expect(reducer({
      [lock.id]: lock,
    }, {
      type: CREATE_LOCK,
      lock,
    })).toEqual({
      [lock.id]: lock,
    })

  })

  // It is kind of weird to test this.. but ok, I guess?
  it('should keep the locks when receiving SET_ACCOUNT with an account', () => {
    const account = {}
    expect(reducer({
      [lock.id]: lock,
    }, {
      type: SET_ACCOUNT,
      account,
    })).toEqual({
      [lock.id]: lock,
    })
  })

})
