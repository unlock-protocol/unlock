import {
  LAUNCH_MODAL,
  DISMISS_MODAL,
  waitForWallet,
  dismissWalletCheck,
} from '../../actions/fullScreenModals'
import { KindOfModal } from '../../unlockTypes'

describe('FullScreenModals actions', () => {
  it('should create an action to wait for wallet', () => {
    expect.assertions(1)
    const expectedAction = {
      type: LAUNCH_MODAL,
      kindOfModal: KindOfModal.WalletCheckOverlay,
    }

    expect(waitForWallet()).toEqual(expectedAction)
  })

  it('should create an action to dismiss a wallet check', () => {
    expect.assertions(1)
    const expectedAction = {
      type: DISMISS_MODAL,
      kindOfModal: KindOfModal.WalletCheckOverlay,
    }

    expect(dismissWalletCheck()).toEqual(expectedAction)
  })
})
