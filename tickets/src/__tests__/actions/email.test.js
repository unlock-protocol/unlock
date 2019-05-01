import { sendConfirmation, SEND_CONFIRMATION } from '../../actions/email'

describe('email actions', () => {
  it('should create an action to start loading', () => {
    expect.assertions(1)
    const recipient = 'julien@unlock-protocol.com'
    const ticket = 'data-uri'
    const eventName = 'The party'
    const eventDate = 'June 26th 2019'
    const confirmLink = 'https://tickets....'

    const expectedAction = {
      type: SEND_CONFIRMATION,
      recipient,
      ticket,
      eventName,
      eventDate,
      confirmLink,
    }
    expect(
      sendConfirmation(recipient, ticket, eventName, eventDate, confirmLink)
    ).toEqual(expectedAction)
  })
})
