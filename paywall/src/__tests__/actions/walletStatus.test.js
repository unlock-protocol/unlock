import {
  waitForWallet,
  gotWallet,
  dismissWalletCheck,
  WAIT_FOR_WALLET,
  GOT_WALLET,
  DISMISS_CHECK,
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
  it('should create an action to indicate that the wallet check overlay should be dismissed', () => {
    const expectedAction = { type: DISMISS_CHECK }
    expect(dismissWalletCheck()).toEqual(expectedAction)
  })
})
