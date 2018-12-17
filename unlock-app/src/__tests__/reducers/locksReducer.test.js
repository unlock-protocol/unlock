import reducer from '../../reducers/locksReducer'
import {
  ADD_LOCK,
  CREATE_LOCK,
  UPDATE_LOCK,
  LOCK_DEPLOYED,
} from '../../actions/lock'
import { SET_ACCOUNT } from '../../actions/accounts'
import { DELETE_TRANSACTION } from '../../actions/transaction'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import { SET_LOCK_NAME } from '../../actions/storage'

describe('locks reducer', () => {
  const lock = {
    address: '123',
  }

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({})
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
    expect(
      reducer(
        {
          [lock.address]: lock,
        },
        {
          type: SET_PROVIDER,
        }
      )
    ).toEqual({})
  })

  it('should return the initial state when receveing SET_NETWORK', () => {
    expect(
      reducer(
        {
          [lock.address]: lock,
        },
        {
          type: SET_NETWORK,
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
      [lock.address]: lock,
    })
  })

  it('should delete a lock when DELETE_TRANSACTION is called for a transaction which created that lock', () => {
    const transaction = {
      lock: lock.address,
    }
    expect(
      reducer(
        {
          [lock.address]: lock,
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
      lock: `${lock.address}x`,
    }
    expect(
      reducer(
        {
          [lock.address]: lock,
        },
        {
          type: DELETE_TRANSACTION,
          transaction,
        }
      )
    ).toEqual({
      [lock.address]: lock,
    })
  })

  // It is kind of weird to test this.. but ok, I guess?
  it('should keep the locks when receiving SET_ACCOUNT with an account', () => {
    const account = {}
    expect(
      reducer(
        {
          [lock.address]: lock,
        },
        {
          type: SET_ACCOUNT,
          account,
        }
      )
    ).toEqual({
      [lock.address]: lock,
    })
  })

  it('should add the name and address of a lock when receiving SET_LOCK_NAME', () => {
    const lockName = 'foo'
    const reduction = reducer(
      {
        [lock.address]: lock,
      },
      {
        type: SET_LOCK_NAME,
        address: lock.address,
        name: lockName,
      }
    )

    expect(reduction).toHaveProperty(`${lock.address}.name`, lockName)
    expect(reduction).toHaveProperty(`${lock.address}.address`, '123')
  })

  describe('ADD_LOCK', () => {
    it('should raise an error if the address is a mismatch', () => {
      const state = {}
      const action = {
        type: ADD_LOCK,
        address: '0x123',
        lock: {
          address: '0x456',
        },
      }
      expect(() => {
        reducer(state, action)
      }).toThrowError('Mismatch in lock address')
    })

    it('should raise an error if the lock was previously added', () => {
      const state = {
        '0x123': {},
      }
      const action = {
        type: ADD_LOCK,
        address: '0x123',
        lock: {
          address: '0x123',
        },
      }
      expect(() => {
        reducer(state, action)
      }).toThrowError('Lock already exists')
    })

    it('should add the lock and add its address', () => {
      const state = {
        '0x456': {},
      }
      const action = {
        type: ADD_LOCK,
        address: '0x123',
        lock: {
          name: 'hello',
        },
      }

      expect(reducer(state, action)).toEqual({
        '0x456': {},
        '0x123': {
          address: '0x123',
          name: 'hello',
        },
      })
    })
  })

  describe('UPDATE_LOCK', () => {
    it('should trigger an error if trying to update the lock address', () => {
      const state = {
        '0x123': {
          name: 'hello',
          address: '0x123',
        },
      }
      const action = {
        type: UPDATE_LOCK,
        address: '0x123',
        update: {
          address: '0x456',
        },
      }
      expect(() => {
        reducer(state, action)
      }).toThrowError('Could not change the lock address')
    })

    it('should throw when the lock being updated does not exist', () => {
      const state = {
        '0x123': {
          name: 'hello',
          address: '0x123',
        },
      }
      const action = {
        type: UPDATE_LOCK,
        address: '0x456',
        update: {
          address: '0x456',
        },
      }
      expect(() => {
        reducer(state, action)
      }).toThrowError('Could not update missing lock')
    })

    it('should update the locks values', () => {
      const state = {
        '0x123': {
          name: 'hello',
          address: '0x123',
        },
      }
      const action = {
        type: UPDATE_LOCK,
        address: '0x123',
        update: {
          name: 'world',
          keyPrice: '1.001',
        },
      }
      expect(reducer(state, action)).toEqual({
        '0x123': {
          name: 'world',
          address: '0x123',
          keyPrice: '1.001',
        },
      })
    })
  })

  describe('LOCK_DEPLOYED', () => {
    describe('if the deployed lock has an older address', () => {
      it('should update the lock and re-assign it to the new address without the pending flag', () => {
        const state = {
          '0x123': {
            name: 'hello',
            address: '0x123',
            pending: true,
          },
        }
        const action = {
          type: LOCK_DEPLOYED,
          address: '0x456',
          lock: {
            address: '0x123',
          },
        }

        expect(reducer(state, action)).toEqual({
          '0x456': {
            address: '0x456',
            name: 'hello',
          },
        })
      })
    })

    describe('if the deployed lock does not have an older address', () => {
      describe('if a lock exists with the new address and remove the pending flag', () => {
        it('should update the lock', () => {
          const state = {
            '0x123': {
              name: 'hello',
              address: '0x123',
              pending: true,
            },
          }
          const action = {
            type: LOCK_DEPLOYED,
            address: '0x123',
            lock: {
              name: 'world',
            },
          }
          expect(reducer(state, action)).toEqual({
            '0x123': { address: '0x123', name: 'world' },
          })
        })
      })

      describe('if no lock exists with the new address', () => {
        it('should just assign it', () => {
          const state = {
            '0x123': {
              name: 'hello',
              address: '0x123',
            },
          }
          const action = {
            type: LOCK_DEPLOYED,
            address: '0x456',
            lock: {
              name: 'world',
            },
          }
          expect(reducer(state, action)).toEqual({
            '0x123': { address: '0x123', name: 'hello' },
            '0x456': { address: '0x456', name: 'world' },
          })
        })
      })
    })
  })
})
