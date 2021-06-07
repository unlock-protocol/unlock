import React from 'react'
import * as rtl from '@testing-library/react'
import CheckoutWrapper from '../../../../components/interface/checkout/CheckoutWrapper'

describe('CheckoutWrapper', () => {
  it('renders the footer', () => {
    expect.assertions(1)

    const hideCheckout = jest.fn()
    const allowClose = false

    const { container } = rtl.render(
      <CheckoutWrapper
        back={jest.fn()}
        showBack={false}
        hideCheckout={hideCheckout}
        allowClose={allowClose}
      />
    )

    // the close button is also an a tag, but it doesn't render when allowClose is false
    expect(container.getElementsByTagName('a')).toHaveLength(1)
  })

  it('does not have a close button when allowClose is false', () => {
    expect.assertions(1)

    const hideCheckout = jest.fn()
    const allowClose = false

    const { queryByTitle } = rtl.render(
      <CheckoutWrapper
        back={jest.fn()}
        showBack={false}
        hideCheckout={hideCheckout}
        allowClose={allowClose}
      />
    )

    expect(queryByTitle('Close')).toBeNull()
  })

  it('calls hideCheckout on click when allowClose is true', () => {
    expect.assertions(2)

    const hideCheckout = jest.fn()
    const allowClose = true

    const { getByTitle } = rtl.render(
      <CheckoutWrapper
        back={jest.fn()}
        showBack={false}
        hideCheckout={hideCheckout}
        allowClose={allowClose}
      />
    )

    const button = getByTitle('Close')

    expect(hideCheckout).not.toHaveBeenCalled()

    rtl.fireEvent.click(button)

    expect(hideCheckout).toHaveBeenCalled()
  })
})
