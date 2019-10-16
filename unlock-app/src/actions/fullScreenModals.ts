import { KindOfModal } from '../unlockTypes'

export const LAUNCH_MODAL = 'fullScreenModal/LAUNCH'
export const DISMISS_MODAL = 'fullScreenModal/DISMISS'

// General events, in terms of which other kinds of modal interaction should be
// defined.
export const launchModal = (kindOfModal: KindOfModal, data?: any) => ({
  type: LAUNCH_MODAL,
  kindOfModal,
  data,
})

// The dismissal method is specialized on the off chance that an action gets set
// on a timeout. This ensures that nobody but the originator of the modal can
// dismiss the modal.
export const dismissModal = (kindOfModal: KindOfModal) => ({
  type: DISMISS_MODAL,
  kindOfModal,
})

// Wallet status
export const waitForWallet = () => launchModal(KindOfModal.WalletCheckOverlay)
export const dismissWalletCheck = () =>
  dismissModal(KindOfModal.WalletCheckOverlay)

// QRDisplay
export const displayQR = (data: string) =>
  launchModal(KindOfModal.QRDisplay, data)
export const dismissQR = () => dismissModal(KindOfModal.QRDisplay)
