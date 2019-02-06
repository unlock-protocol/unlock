import reducer from '../../reducers/walletStatusReducer'
import { WAIT_FOR_WALLET, GOT_WALLET } from '../../actions/walletStatus'

describe('walletStatusReducer', () => {
  const notWaiting = { waiting: false }
  const waiting = { waiting: true }
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(notWaiting)
  })

  it('should set waiting to true when receiving WAIT_FOR_WALLET', () => {
    expect(reducer(notWaiting, { type: WAIT_FOR_WALLET })).toEqual(waiting)
  })

  it('should set waiting to false when receiving GOT_WALLET', () => {
    expect(reducer(waiting, { type: GOT_WALLET })).toEqual(notWaiting)
  })
})
