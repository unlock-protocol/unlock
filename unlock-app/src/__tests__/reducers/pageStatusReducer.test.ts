import reducer, { initialState } from '../../reducers/pageStatusReducer'
import { setLockedState } from '../../actions/pageStatus'

describe('pageStatusReducer', () => {
  it('should set state in response to setLockedState', () => {
    expect.assertions(3)
    let isLocked: boolean = initialState

    // State just takes whatever boolean is passed into it
    isLocked = reducer(isLocked, setLockedState(true))
    expect(isLocked).toBeTruthy()

    isLocked = reducer(isLocked, setLockedState(false))
    expect(isLocked).toBeFalsy()

    isLocked = reducer(isLocked, setLockedState(true))
    expect(isLocked).toBeTruthy()
  })
})
