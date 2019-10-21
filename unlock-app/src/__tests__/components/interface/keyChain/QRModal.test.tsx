import React from 'react'
import * as rtl from 'react-testing-library'
import QRModal from '../../../../components/interface/keyChain/QRModal'

let dismiss: jest.Mock<any, any>
let sendEmail: jest.Mock<any, any>
const render = () => {
  dismiss = jest.fn()
  sendEmail = jest.fn()
  return rtl.render(
    <QRModal
      active
      dismiss={dismiss}
      sendEmail={sendEmail}
      value="just some test data"
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

    const submit = getByText('Send Email')
    rtl.fireEvent.click(submit)

    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('should call the sendEmail function when input is full', () => {
    expect.assertions(2)
    const { getByPlaceholderText, getByText } = render()

    const input = getByPlaceholderText('Email address')
    rtl.fireEvent.change(input, { target: { value: 'ronald@mcdonalds.gov' } })
    expect((input as HTMLInputElement).value).toBe('ronald@mcdonalds.gov')

    const submit = getByText('Send Email')
    rtl.fireEvent.click(submit)
    expect(sendEmail).toHaveBeenCalledWith('ronald@mcdonalds.gov')
  })
})
