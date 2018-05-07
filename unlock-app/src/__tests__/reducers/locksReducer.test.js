import reducer from '../../reducers/locksReducer'
import { SET_LOCK } from '../../actions/lock'
import { SET_ACCOUNT } from '../../actions/accounts'

describe('locks reducer', () => {

  const lock = {
    address: '0x123',
  }

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual([])
  })

  it('should add the lock when receiving SET_LOCK and if it was not there yet', () => {
    expect(reducer(undefined, {
      type: SET_LOCK,
      lock,
    })).toEqual([lock])
  })

  it('should not add the lock twice even when receiving SET_LOCK again', () => {
    expect(reducer([lock], {
      type: SET_LOCK,
      lock,
    })).toEqual([lock])

  })

  it('should keep the locks when receiving SET_ACCOUNT with an account', () => {
    const account = {}
    expect(reducer([lock], {
      type: SET_ACCOUNT,
      account,
    })).toEqual([lock])
  })

  it('should reset the locks when receiving SET_ACCOUNT with no account', () => {
    expect(reducer([lock], {
      type: SET_ACCOUNT,
      account: null,
    })).toEqual([])
  })

})
