import React from 'react'
import * as rtl from 'react-testing-library'
import { EventTicket } from '../../../components/interface/EventTicket'

describe('EventTicket component', () => {
  it('should send a confirmation using the sendConfirmation in the props', () => {
    expect.assertions(1)
    const sendConfirmation = jest.fn()

    const { container } = rtl.render(
      <EventTicket lockAddress="0x123abc" sendConfirmation={sendConfirmation} />
    )

    const inputs = container.querySelectorAll('input')
    const emailInput = inputs[0]
    const submitButton = inputs[1]

    const emailAddress = 'anemail@com.com'
    rtl.fireEvent.change(emailInput, { target: { value: emailAddress } })
    rtl.fireEvent.click(submitButton)
    // We can't fully test this because there is no canvas for the QR code to be in,
    // but this way we know the correct function is called.
    expect(sendConfirmation).toHaveBeenCalled()
  })
})
