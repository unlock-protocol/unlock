import reducer, { initialState } from '../../reducers/loadingReducer'
import { START_LOADING, DONE_LOADING } from '../../actions/loading'

describe('loading reducer', () => {
  it('should return the initial state', () => {
    expect.assertions(1)
    expect(reducer(undefined, {})).toEqual(initialState)
  })

  it('should return increase the state when loading starts', () => {
    expect.assertions(1)
    const state = 100
    expect(
      reducer(state, {
        type: START_LOADING,
      })
    ).toBe(state + 1)
  })

  it('should return decrease the state when loading starts', () => {
    expect.assertions(1)
    const state = 100
    expect(
      reducer(state, {
        type: DONE_LOADING,
      })
    ).toBe(state - 1)
  })
})
