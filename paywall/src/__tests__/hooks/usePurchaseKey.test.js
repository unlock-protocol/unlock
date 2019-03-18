import React from 'react'
import * as rtl from 'react-testing-library'

import usePostMessage from '../../hooks/browser/usePostMessage'
import usePurchaseKey from '../../hooks/usePurchaseKey'
import { POST_MESSAGE_REDIRECT } from '../../paywall-builder/constants'

jest.mock('../../hooks/browser/usePostMessage')
describe('usePurchaseKey hook', () => {
  let postMessage
  let openInNewWindow
  let purchaseKey
  beforeEach(() => {
    postMessage = jest.fn()
    purchaseKey = jest.fn()
    usePostMessage.mockImplementation(() => ({
      postMessage,
    }))
  })
  function MockPurchaseKey() {
    const purchase = usePurchaseKey(purchaseKey, openInNewWindow)
    return (
      <button type="button" onClick={() => purchase('hi')}>
        Click
      </button>
    )
  }

  describe('purchase', () => {
    it('calls purchaseKey if openInNewWindow is false', () => {
      expect.assertions(2)

      openInNewWindow = false
      const component = rtl.render(<MockPurchaseKey />)

      rtl.act(() => {
        rtl.fireEvent.click(component.getByText('Click'))
      })

      expect(purchaseKey).toHaveBeenCalledWith('hi')
      expect(postMessage).not.toHaveBeenCalled()
    })

    it('calls postMessage if openInNewWindow is true', () => {
      expect.assertions(2)

      openInNewWindow = true
      const component = rtl.render(<MockPurchaseKey />)

      rtl.act(() => {
        rtl.fireEvent.click(component.getByText('Click'))
      })

      expect(purchaseKey).not.toHaveBeenCalled()
      expect(postMessage).toHaveBeenCalledWith(POST_MESSAGE_REDIRECT)
    })
  })
})
