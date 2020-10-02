import reducer, { initialState } from '../../reducers/fullScreenModalsReducer'

import { LAUNCH_MODAL, DISMISS_MODAL } from '../../actions/fullScreenModals'

import { KindOfModal } from '../../unlockTypes'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import { SET_ACCOUNT } from '../../actions/accounts'

describe('fullScreenModalsReducer', () => {
  const walletModal = {
    active: true,
    kindOfModal: KindOfModal.WalletCheckOverlay,
  }
  const walletAction = {
    type: LAUNCH_MODAL,
    kindOfModal: KindOfModal.WalletCheckOverlay,
  }
  it.each([SET_ACCOUNT, SET_PROVIDER, SET_NETWORK, DISMISS_MODAL])(
    'should return initialState when receiving %s',
    (actionType) => {
      expect.assertions(1)
      const action = { type: actionType }
      expect(reducer(walletModal, action)).toEqual(initialState)
    }
  )

  it('should launch the modal when given LAUNCH_MODAL', () => {
    expect.assertions(1)
    expect(reducer(initialState, walletAction)).toEqual(walletModal)
  })
})
