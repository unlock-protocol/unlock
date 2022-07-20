import WedlockService, { emailTemplate } from '../../services/wedlockService'
import fetch from 'node-fetch'
jest.mock('node-fetch', () => jest.fn())

let w = new WedlockService('http://notareal.host')

describe('Wedlocks Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    w = new WedlockService('http://notareal.host')
  })

  it('should request an email confirmation, with the right headers and params', async () => {
    expect.assertions(1)
    const recipient = 'thomas.elphinstone+2@hambled.on'
    const expectedPayload = {
      template: emailTemplate.signupConfirmation,
      recipient,
      params: {
        email: encodeURIComponent(recipient),
        signedEmail: {
          value: recipient,
          encrypt: true,
        },
        confirmLink: 'https://mcdonalds.gov',
      },
      attachments: [],
    }

    const fetchExpected = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expectedPayload),
    }

    fetch.mockResolvedValue(fetchExpected)

    const resp = await w.confirmEmail(recipient, 'https://mcdonalds.gov')

    expect(fetch).toHaveBeenCalledWith('http://notareal.host', fetchExpected)
  })

  it('should request a welcome email, with the right headers and params', async () => {
    expect.assertions(1)
    const recipient = 'julien@unlock-protocol.com'
    const expectedPayload = {
      template: emailTemplate.welcome,
      recipient,
      params: {
        email: encodeURIComponent(recipient),
        recoveryLink: 'https://recovery',
      },
      attachments: [],
    }

    const fetchExpected = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expectedPayload),
    }

    fetch.mockResolvedValue(fetchExpected)
    await w.welcomeEmail(recipient, 'https://recovery')

    expect(fetch).toHaveBeenCalledWith('http://notareal.host', fetchExpected)
  })

  it('should request a welcome email, with the right headers and params, including an encoded URL', async () => {
    expect.assertions(1)
    const recipient = 'julien+hello@unlock-protocol.com'
    const expectedPayload = {
      template: emailTemplate.welcome,
      recipient,
      params: {
        email: encodeURIComponent(recipient),
        recoveryLink: 'https://recovery',
      },
      attachments: [],
    }

    const fetchExpected = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expectedPayload),
    }

    fetch.mockResolvedValue(fetchExpected)
    await w.welcomeEmail(recipient, 'https://recovery')

    expect(fetch).toHaveBeenCalledWith('http://notareal.host', fetchExpected)
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
    const fetchExpected = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expectedPayload),
    }

    fetch.mockResolvedValue(fetchExpected)
    await w.keychainQREmail(recipient, keychainLink, lockName, qrData)

    expect(fetch).toHaveBeenCalledWith('http://notareal.host', fetchExpected)
  })
})
