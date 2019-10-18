import {
  GOT_RECOVERY_PHRASE,
  RESET_RECOVERY_PHRASE,
} from '../../actions/recovery'

import reducer, { initialState } from '../../reducers/recoveryReducer'

describe('recovery reducer', () => {
  it('should return the initial state', () => {
    expect.assertions(1)
    expect(initialState).toEqual(null)
  })

  it('should handle GOT_RECOVERY_PHRASE', () => {
    expect.assertions(1)
    const state = null
    const recoveryPhrase = 'recovery'
    expect(
      reducer(state, {
        type: GOT_RECOVERY_PHRASE,
        recoveryPhrase,
      })
    ).toBe(recoveryPhrase)
  })

  it('should handle RESET_RECOVERY_PHRASE', () => {
    expect.assertions(1)
    const state = 'recovery'
    expect(
      reducer(state, {
        type: RESET_RECOVERY_PHRASE,
      })
    ).toBe(initialState)
  })
})
