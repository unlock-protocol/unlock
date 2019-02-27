import reducer, { initialState } from '../../reducers/walletStatusReducer'
import {
  WAIT_FOR_WALLET,
  GOT_WALLET,
  DISMISS_CHECK,
} from '../../actions/walletStatus'

describe('walletStatusReducer', () => {
  const waiting = { waiting: true }
  it('should return the initial state', () => {
    expect.assertions(1)
    expect(reducer(undefined, {})).toEqual(initialState)
  })

  it('should set waiting to true when receiving WAIT_FOR_WALLET', () => {
    expect.assertions(1)
    expect(reducer(initialState, { type: WAIT_FOR_WALLET })).toEqual(waiting)
  })

  it('should set waiting to false when receiving GOT_WALLET', () => {
    expect.assertions(1)
    expect(reducer(waiting, { type: GOT_WALLET })).toEqual(initialState)
  })

  it('should set waiting to false when receiving DISMISS_CHECK', () => {
    expect.assertions(1)
    expect(reducer(waiting, { type: DISMISS_CHECK })).toEqual(initialState)
  })
})
