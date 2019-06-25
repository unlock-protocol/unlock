import { LAUNCH_MODAL, DISMISS_MODAL } from '../actions/fullScreenModals'

import { KindOfModal, Action } from '../unlockTypes'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SET_ACCOUNT } from '../actions/accounts'

export const initialState = {
  active: false,
  // kindOfModal defaults to WalletCheckOverlay to satisfy the type
  // checker. This is fine because all of the methods that launch the modal also
  // set the appropriate kind of modal.
  kindOfModal: KindOfModal.WalletCheckOverlay,
}

const fullScreenModalsReducer = (
  fullScreenModalStatus = initialState,
  action: Action
) => {
  if (
    [SET_PROVIDER, SET_NETWORK, SET_ACCOUNT, DISMISS_MODAL].indexOf(
      action.type
    ) > -1
  ) {
    return initialState
  }

  if (action.type === LAUNCH_MODAL) {
    const { kindOfModal } = action
    return {
      active: true,
      kindOfModal,
    }
  }

  // Dismissing the modal is accomplished in the first conditional, in case you
  // skipped over it.

  return fullScreenModalStatus
}

export default fullScreenModalsReducer
