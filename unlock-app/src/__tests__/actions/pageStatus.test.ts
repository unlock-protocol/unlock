import { setLockedState, SET_LOCKED_STATE } from '../../actions/pageStatus'

describe('setLockedState', () => {
  it('should create an action for when the page is locked', () => {
    expect.assertions(1)

    expect(setLockedState(true)).toEqual({
      type: SET_LOCKED_STATE,
      isLocked: true,
    })
  })

  it('should create an action for when the page is unlocked', () => {
    expect.assertions(1)

    expect(setLockedState(false)).toEqual({
      type: SET_LOCKED_STATE,
      isLocked: false,
    })
  })
})
