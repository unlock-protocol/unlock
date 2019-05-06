import axios from 'axios'
import WedlockService, { emailTemplate } from '../../services/wedlockService'

jest.mock('axios')

let w
describe('Wedlocks Service', () => {
  beforeEach(() => {
    w = new WedlockService('http://notareal.host')
  })

  describe('confirmEvent', () => {
    it('should should request an email confirmation, with the right headers', async () => {
      expect.assertions(1)
      const recipient = 'thomas.elphinstone@hambled.on'
      const ticket = 'ticket-as-data-uri'
      const eventName = 'My party'
      const eventDate = 'December 26th 2019'
      const ticketLink = 'http://tickets.unlock-protocol.com/0x...'

      const expectedPayload = {
        template: emailTemplate.confirmEvent,
        recipient,
        attachments: [
          {
            path: ticket,
          },
        ],
        params: {
          eventName,
          eventDate,
          ticketLink,
        },
      }
      axios.post.mockReturnValue()
      await w.confirmEvent(recipient, ticket, eventName, eventDate, ticketLink)

      expect(axios.post).toHaveBeenCalledWith(
        'http://notareal.host',
        expectedPayload,
        {
          headers: {
            'content-type': 'application/json',
          },
        }
      )
    })
  })
})
