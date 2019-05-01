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
      const confirmLink = 'http://tickets.unlock-protocol.com/0x...'

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
          confirmLink,
        },
      }
      axios.post.mockReturnValue()
      await w.confirmEvent(recipient, ticket, eventName, eventDate, confirmLink)

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
