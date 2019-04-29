import React from 'react'
import * as rtl from 'react-testing-library'
import { TicketCode } from '../../../components/content/purchase/TicketCode'

const config = {
  unlockTicketsUrl: 'https://tickets.unlock-protocol.com',
}

describe('TicketCode', () => {
  it('should display a QR code when a signed address and public key are supplied', () => {
    expect.assertions(1)

    const wrapper = rtl.render(
      <TicketCode
        signedAddress="this-is-a-signed-address"
        publicKey="12345"
        lockAddress="0x1234"
        config={config}
      />
    )

    expect(wrapper.container.querySelector('svg')).not.toBeNull()
  })

  it('should not display a QR code when a signed address and public key are not supplied', () => {
    expect.assertions(1)

    const wrapper = rtl.render(<TicketCode config={config} />)

    expect(wrapper.container.querySelector('svg')).toBeNull()
  })
})
