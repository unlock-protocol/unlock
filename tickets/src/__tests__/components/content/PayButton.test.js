import React from 'react'
import * as rtl from 'react-testing-library'

import configure from '../../../config'
import { PayButton } from '../../../components/content/purchase/PayButton'
import { KeyStatus } from '../../../selectors/keys'

const config = configure({})

describe('PayButton', () => {
  it('should display the call to pay when the transaction is null', () => {
    expect.assertions(1)
    const wrapper = rtl.render(
      <PayButton config={config} purchaseKey={() => {}} />
    )
    expect(wrapper.getByText('Pay & Register for This Event')).not.toBeNull()
  })
  it('should trigger purchasekey when the button is clicked and the key has not been bought', () => {
    expect.assertions(1)
    const purchaseKey = jest.fn()
    const wrapper = rtl.render(
      <PayButton config={config} purchaseKey={purchaseKey} />
    )
    let button = wrapper.getByText('Pay & Register for This Event')
    rtl.fireEvent.click(button)
    expect(purchaseKey).toHaveBeenCalled()
  })
  it('should not trigger purchasekey when the button is clicked and the key has been bought', () => {
    expect.assertions(2)
    const purchaseKey = jest.fn()
    const transaction = {
      status: 'submitted',
    }
    const wrapper = rtl.render(
      <PayButton
        config={config}
        transaction={transaction}
        purchaseKey={purchaseKey}
      />
    )
    let button = wrapper.getByText('Payment Sent ...')
    expect(button).not.toBeNull()
    rtl.fireEvent.click(button)
    expect(purchaseKey).not.toHaveBeenCalled()
  })
  it('should not trigger purchasekey when the button is clicked and the key transaction is confirming', () => {
    expect.assertions(2)
    const purchaseKey = jest.fn()
    const transaction = {
      status: 'mined',
      confirmations: 3,
    }
    const wrapper = rtl.render(
      <PayButton
        config={config}
        transaction={transaction}
        purchaseKey={purchaseKey}
      />
    )
    let button = wrapper.queryByText('Confirming Payment', { exact: false })
    expect(button).not.toBeNull()
    rtl.fireEvent.click(button)
    expect(purchaseKey).not.toHaveBeenCalled()
  })
  it('should not trigger purchasekey when the button is clicked and the key is confirming', () => {
    expect.assertions(2)
    const purchaseKey = jest.fn()
    const wrapper = rtl.render(
      <PayButton
        config={config}
        keyStatus={KeyStatus.CONFIRMING}
        purchaseKey={purchaseKey}
      />
    )
    let button = wrapper.queryByText('Confirming Payment', { exact: false })
    expect(button).not.toBeNull()
    rtl.fireEvent.click(button)
    expect(purchaseKey).not.toHaveBeenCalled()
  })
  it('should not trigger purchasekey when the button is clicked and the key transaction is confirmed', () => {
    expect.assertions(2)
    const purchaseKey = jest.fn()
    const transaction = {
      status: 'mined',
      confirmations: 14,
    }
    const wrapper = rtl.render(
      <PayButton
        config={config}
        transaction={transaction}
        purchaseKey={purchaseKey}
      />
    )
    let button = wrapper.getByText('Confirmed')
    expect(button).not.toBeNull()
    rtl.fireEvent.click(button)
    expect(purchaseKey).not.toHaveBeenCalled()
  })
  it('should not trigger purchasekey when the button is clicked and the key is confirmed', () => {
    expect.assertions(2)
    const purchaseKey = jest.fn()
    const wrapper = rtl.render(
      <PayButton
        config={config}
        keyStatus={KeyStatus.VALID}
        purchaseKey={purchaseKey}
      />
    )
    let button = wrapper.getByText('Confirmed')
    expect(button).not.toBeNull()
    rtl.fireEvent.click(button)
    expect(purchaseKey).not.toHaveBeenCalled()
  })
})
