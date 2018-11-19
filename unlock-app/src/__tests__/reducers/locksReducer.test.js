import reducer from '../../reducers/locksReducer'
import { CREATE_LOCK } from '../../actions/lock'
import { SET_ACCOUNT } from '../../actions/accounts'
import { DELETE_TRANSACTION } from '../../actions/transaction'
import { SET_PROVIDER } from '../../actions/provider'

describe('locks reducer', () => {
  const lock = {
    id: '123',
  }

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({})
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
    expect(
      reducer(
        {
          [lock.id]: lock,
        },
        {
          type: SET_PROVIDER,
        }
      )
    ).toEqual({})
  })

  it('should add the lock when receiving CREATE_LOCK and if it was not there yet', () => {
    expect(
      reducer(undefined, {
        type: CREATE_LOCK,
        lock,
      })
    ).toEqual({
      [lock.id]: lock,
    })
  })

  it('should not add the lock twice even when receiving CREATE_LOCK again', () => {
    expect(
      reducer(
        {
          [lock.id]: lock,
        },
        {
          type: CREATE_LOCK,
          lock,
        }
      )
    ).toEqual({
      [lock.id]: lock,
    })
  })

  it('should delete a lock when DELETE_TRANSACTION is called for a transaction which created that lock', () => {
    const transaction = {
      lock: lock.id,
    }
    expect(
      reducer(
        {
          [lock.id]: lock,
        },
        {
          type: DELETE_TRANSACTION,
          transaction,
        }
      )
    ).toEqual({})
  })

  it('should not delete a lock when DELETE_TRANSACTION is called for a transaction which created another lock', () => {
    const transaction = {
      lock: `${lock.id}x`,
    }
    expect(
      reducer(
        {
          [lock.id]: lock,
        },
        {
          type: DELETE_TRANSACTION,
          transaction,
        }
      )
    ).toEqual({
      [lock.id]: lock,
    })
  })

  // It is kind of weird to test this.. but ok, I guess?
  it('should keep the locks when receiving SET_ACCOUNT with an account', () => {
    const account = {}
    expect(
      reducer(
        {
          [lock.id]: lock,
        },
        {
          type: SET_ACCOUNT,
          account,
        }
      )
    ).toEqual({
      [lock.id]: lock,
    })
  })
})
