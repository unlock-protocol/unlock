import axios from 'axios'
import WedlockService, { emailTemplate } from '../../services/wedlockService'

jest.mock('axios')

let w = new WedlockService('http://notareal.host')
describe('Wedlocks Service', () => {
  beforeEach(() => {
    w = new WedlockService('http://notareal.host')
  })

  it('should request an email confirmation, with the right headers and params', async () => {
    expect.assertions(1)
    const recipient = 'thomas.elphinstone+2@hambled.on'
    const expectedPayload = {
      template: emailTemplate.signupConfirmation,
      recipient,
      params: {
        confirmLink: 'https://mcdonalds.gov',
        email: encodeURIComponent(recipient),
        signedEmail: {
          encrypt: true,
          value: recipient,
        },
      },
      attachments: [],
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

  it('should request a welcome email, with the right headers and params', async () => {
    expect.assertions(1)
    const recipient = 'julien@unlock-protocol.com'
    const expectedPayload = {
      template: emailTemplate.welcome,
      recipient,
      params: {
        recoveryLink: 'https://recovery',
        email: encodeURIComponent(recipient),
      },
      attachments: [],
    }
    axios.post.mockReturnValue()
    await w.welcomeEmail(recipient, 'https://recovery')

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

  it('should request a welcome email, with the right headers and params, including an encoded URL', async () => {
    expect.assertions(1)
    const recipient = 'julien+hello@unlock-protocol.com'
    const expectedPayload = {
      template: emailTemplate.welcome,
      recipient,
      params: {
        recoveryLink: 'https://recovery',
        email: encodeURIComponent(recipient),
      },
      attachments: [],
    }
    axios.post.mockReturnValue()
    await w.welcomeEmail(recipient, 'https://recovery')

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

  it('should request a QR code email, with the right headers and params', async () => {
    expect.assertions(1)
    const recipient = 'jefferson@airpla.ne'
    const keychainLink = 'https://app.unlock-protocol.com/keychain'
    const lockName = 'Unlock Blog Members'
    const qrData = 'image a huge base64 string of image data'
    const expectedPayload = {
      template: emailTemplate.keyOwnership,
      recipient,
      params: {
        keychainLink,
        lockName,
      },
      attachments: [{ path: qrData }],
    }
    axios.post.mockReturnValue()
    await w.keychainQREmail(recipient, keychainLink, lockName, qrData)

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
