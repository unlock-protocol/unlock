import {
  LAUNCH_MODAL,
  DISMISS_MODAL,
  waitForWallet,
  dismissWalletCheck,
  displayQR,
  dismissQR,
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

  it('should create an action to display a QR code', () => {
    expect.assertions(1)
    const expectedAction = {
      type: LAUNCH_MODAL,
      kindOfModal: KindOfModal.QRDisplay,
      data: 'some data',
    }

    expect(displayQR('some data')).toEqual(expectedAction)
  })

  it('should create an action to dismiss a QR code', () => {
    expect.assertions(1)
    const expectedAction = {
      type: DISMISS_MODAL,
      kindOfModal: KindOfModal.QRDisplay,
    }

    expect(dismissQR()).toEqual(expectedAction)
  })
})
