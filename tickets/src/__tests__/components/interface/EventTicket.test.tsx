import React from 'react'
import * as rtl from 'react-testing-library'
import { EventTicket } from '../../../components/interface/EventTicket'

describe('EventTicket component', () => {
  it('should send a confirmation using the sendConfirmation in the props', () => {
    expect.assertions(1)
    const sendConfirmation = jest.fn()
    const event = {
      name: 'A fun event',
      date: new Date(),
    }
    const emailAddress = 'anemail@com.com'

    const { container } = rtl.render(
      <EventTicket
        lockAddress="0x123abc"
        sendConfirmation={sendConfirmation}
        event={event}
      />
    )

    const inputs = container.querySelectorAll('input')
    const emailInput = inputs[0]
    const submitButton = inputs[1]

    rtl.fireEvent.change(emailInput, { target: { value: emailAddress } })
    rtl.fireEvent.click(submitButton)

    expect(sendConfirmation).toHaveBeenCalledWith(
      emailAddress,
      null, // No canvas in tests, it returns null (TODO: explore use of node canvas package)
      event.name,
      event.date.toDateString(),
      expect.any(String) // the window.location value isn't meaningful in this context
    )
  })
})
