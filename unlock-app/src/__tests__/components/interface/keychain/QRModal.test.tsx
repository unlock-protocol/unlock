import React from 'react'
import * as rtl from '@testing-library/react'
import QRModal from '../../../../components/interface/keychain/QRModal'

let dismiss: jest.Mock<any, any>
let sendEmail: jest.Mock<any, any>
const lock = {
  address: '',
}

const render = () => {
  dismiss = jest.fn()
  sendEmail = jest.fn()
  return rtl.render(
    <QRModal
      lock={lock}
      active
      dismiss={dismiss}
      sendEmail={sendEmail}
      signature="signature"
    />
  )
}

describe('QRModal', () => {
  it('should render a QR code', () => {
    expect.assertions(1)
    const { container } = render()

    expect(container.querySelector('canvas')).not.toBeNull()
  })

  it('should have a disabled submit button when input is empty', () => {
    expect.assertions(1)
    const { getByText } = render()

    const submit = getByText('Receive by email')
    rtl.fireEvent.click(submit)

    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('should have a disabled submit button when the input is not a valid email address', () => {
    expect.assertions(2)
    const { getByPlaceholderText, getByText } = render()

    const input = getByPlaceholderText('me@domain.tld')
    rtl.fireEvent.change(input, { target: { value: 'ronald' } })
    expect((input as HTMLInputElement).value).toBe('ronald')

    const submit = getByText('Receive by email')
    rtl.fireEvent.click(submit)
    // second param here is the default mock result for the canvas mock
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('should call the sendEmail function when input is a valid email address', () => {
    expect.assertions(2)
    const { getByPlaceholderText, getByText } = render()

    const input = getByPlaceholderText('me@domain.tld')
    rtl.fireEvent.change(input, { target: { value: 'ronald@mcdonalds.gov' } })
    expect((input as HTMLInputElement).value).toBe('ronald@mcdonalds.gov')

    const submit = getByText('Receive by email')
    rtl.fireEvent.click(submit)
    // second param here is the default mock result for the canvas mock
    expect(sendEmail).toHaveBeenCalledWith(
      'ronald@mcdonalds.gov',
      'data:image/png;base64,00'
    )

    // and the submit button should change to say "Sent!"
    getByText('Sent!')
  })
})
