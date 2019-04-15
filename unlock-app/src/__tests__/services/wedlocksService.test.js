import axios from 'axios'
import WedlocksService, { emailTemplate } from '../../services/wedlocksService'

jest.mock('axios')

let w
describe('Wedlocks Service', () => {
  beforeEach(() => {
    w = new WedlocksService('http://notareal.host')
  })

  it('should should request an email confirmation, with the right headers', async () => {
    expect.assertions(1)
    const recipient = 'thomas.elphinstone@hambled.on'
    const expectedPayload = {
      template: emailTemplate.signupConfirmation,
      recipient,
      params: {},
    }
    axios.post.mockReturnValue()
    await w.confirmEmail(recipient)

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
