import React from 'react'
import * as rtl from 'react-testing-library'
import { TicketCode } from '../../../components/content/purchase/TicketCode'

describe('TicketCode', () => {
  it('should display a QR code when a signed address and public key are supplied', () => {
    expect.assertions(1)

    const wrapper = rtl.render(
      <TicketCode
        signedAddress="https://unlock-protocol.com"
        publicKey="12345"
      />
    )

    expect(wrapper.container.querySelector('svg')).not.toBeNull()
  })

  it('should not display a QR code when a signed address and public key are not supplied', () => {
    expect.assertions(1)

    const wrapper = rtl.render(<TicketCode />)

    expect(wrapper.container.querySelector('svg')).toBeNull()
  })
})
