import {
  waitForWallet,
  gotWallet,
  WAIT_FOR_WALLET,
  GOT_WALLET,
} from '../../actions/walletStatus'

describe('walletStatus actions', () => {
  it('should create and action to wait for the wallet', () => {
    const expectedAction = { type: WAIT_FOR_WALLET }
    expect(waitForWallet()).toEqual(expectedAction)
  })
  it('should create and action to indicate that the wallet is available', () => {
    const expectedAction = { type: GOT_WALLET }
    expect(gotWallet()).toEqual(expectedAction)
  })
})
