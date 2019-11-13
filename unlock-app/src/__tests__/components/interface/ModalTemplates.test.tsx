import React from 'react'
import * as rtl from '@testing-library/react'
import { KindOfModal } from '../../../unlockTypes'
import { DISMISS_MODAL } from '../../../actions/fullScreenModals'
import { WalletCheck } from '../../../components/interface/modal-templates'

describe('Modal Templates', () => {
  describe('WalletCheck', () => {
    it('should dismiss the overlay when the button is clicked', () => {
      expect.assertions(1)
      const dispatch = jest.fn()

      const { getByText } = rtl.render(<WalletCheck dispatch={dispatch} />)

      const dismissButton = getByText('Dismiss')
      rtl.fireEvent.click(dismissButton)

      expect(dispatch).toHaveBeenCalledWith({
        type: DISMISS_MODAL,
        kindOfModal: KindOfModal.WalletCheckOverlay,
      })
    })
  })
})
