import reducer from '../../reducers/lockReducer'
import { SET_LOCK, RESET_LOCK } from '../../actions/lock'

describe('lock reducer', () => {

  const lock = {}

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({})
  })

  it('should set the lock accordingly when receiving SET_LOCK', () => {
    expect(reducer(undefined, {
      type: SET_LOCK,
      lock,
    })).toEqual(lock)
  })

  it('should set the lock accordingly when receiving RESET_LOCK', () => {
    expect(reducer(undefined, {
      type: RESET_LOCK,
      lock,
    })).toEqual(lock)
  })

})
