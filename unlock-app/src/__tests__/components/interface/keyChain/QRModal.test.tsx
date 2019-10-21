import React from 'react'
import * as rtl from 'react-testing-library'
import QRModal from '../../../../components/interface/keyChain/QRModal'

describe('QRModal', () => {
  it('should render a QR code', () => {
    expect.assertions(1)
    const dismiss = jest.fn()
    const sendEmail = jest.fn()
    const { container } = rtl.render(
      <QRModal
        active
        dismiss={dismiss}
        sendEmail={sendEmail}
        value="just some test data"
      />
    )

    expect(container.querySelector('canvas')).not.toBeNull()
  })
})
