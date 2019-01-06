import { addLock, updateLock } from '../../actions/lock'
import errorsReducer from '../../reducers/errorConditionsReducer'
import { setError } from '../../actions/error'
import { addKey, updateKey } from '../../actions/key'

describe('error conditions reducer', () => {
  let next
  let reducer

  beforeEach(() => {
    next = jest.fn()
    reducer = errorsReducer(next)
  })
  it('should set error if ADD_LOCK has a mismatch', () => {
    reducer(undefined, addLock('0xdeadbeef', { address: '0x04h0h0h0' }))
    expect(next).toHaveBeenCalledWith(
      undefined,
      setError({
        message: 'Mismatch in lock address',
        context: 'Lock: 0x04h0h0h0, Action: 0xdeadbeef',
      })
    )
  })

  it('should set an error if ADD_LOCK for an existing lock', () => {
    const state = {
      locks: {
        '0xdeadbeef': {},
      },
    }

    reducer(state, addLock('0xdeadbeef', { address: '0xdeadbeef' }))

    expect(next).toHaveBeenCalledWith(
      state,
      setError({
        message: 'Lock already exists',
        context: 'Lock: 0xdeadbeef',
      })
    )
  })

  it('should set an error if UPDATE_LOCK is called and the lock to be updated does not match action address', () => {
    reducer(undefined, updateLock('0xdeadbeef', { address: '0x04h0h0h0' }))

    expect(next).toHaveBeenCalledWith(
      undefined,
      setError({
        message: 'Could not change the lock address',
        context: 'Action: 0xdeadbeef, Update: 0x04h0h0h0',
      })
    )
  })

  it('should set an error if UPDATE_LOCK is called on a non-existing lock', () => {
    const state = {
      locks: {},
    }

    reducer(state, updateLock('0xdeadbeef', { address: '0xdeadbeef' }))

    expect(next).toHaveBeenCalledWith(
      state,
      setError({
        message: 'Could not update missing lock',
        context: 'Address: 0xdeadbeef',
      })
    )
  })

  it('should set an error if ADD_KEY is called with non-matching ids', () => {
    reducer(undefined, addKey('0xdeadbeef', { id: '0x04h0h0h0' }))

    expect(next).toHaveBeenCalledWith(
      undefined,
      setError({
        message: 'Could not add key with wrong id',
        context: 'Key: 0x04h0h0h0, Action: 0xdeadbeef',
      })
    )
  })

  it('should set an error if ADD_KEY is called with an existing key id', () => {
    const state = {
      keys: {
        '0xdeadbeef': {},
      },
    }

    reducer(state, addKey('0xdeadbeef', { id: '0xdeadbeef' }))

    expect(next).toHaveBeenCalledWith(
      state,
      setError({
        message: 'Could not add already existing key',
        context: 'Key: 0xdeadbeef',
      })
    )
  })

  it('should set an error if UPDATE_KEY is called with non-matching ids', () => {
    reducer(undefined, updateKey('0xdeadbeef', { id: '0x04h0h0h0' }))

    expect(next).toHaveBeenCalledWith(
      undefined,
      setError({
        message: 'Could not change the key id',
        context: 'Key: 0xdeadbeef, Id: 0x04h0h0h0',
      })
    )
  })

  it('should set an error if UPDATE_KEY is called on a non-existing key', () => {
    const state = {
      keys: {},
    }

    reducer(state, updateKey('0xdeadbeef', { id: '0xdeadbeef' }))

    expect(next).toHaveBeenCalledWith(
      state,
      setError({
        message: 'Could not update missing key',
        context: 'Key: 0xdeadbeef',
      })
    )
  })
})
