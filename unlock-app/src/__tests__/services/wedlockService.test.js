import axios from 'axios'
import WedlockService, { emailTemplate } from '../../services/wedlockService'

jest.mock('axios')

let w
describe('Wedlocks Service', () => {
  beforeEach(() => {
    w = new WedlockService('http://notareal.host')
  })

  it('should should request an email confirmation, with the right headers', async () => {
    expect.assertions(1)
    const recipient = 'thomas.elphinstone@hambled.on'
    const expectedPayload = {
      template: emailTemplate.signupConfirmation,
      recipient,
      params: {
        confirmLink: 'https://mcdonalds.gov',
      },
    }
    axios.post.mockReturnValue()
    await w.confirmEmail(recipient, 'https://mcdonalds.gov')

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
