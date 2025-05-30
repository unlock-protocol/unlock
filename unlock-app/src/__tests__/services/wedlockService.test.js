import WedlockService, { emailTemplate } from '../../services/wedlockService'
import { vi, describe, beforeAll, beforeEach, expect, it } from 'vitest'

let w = new WedlockService('http://notareal.host')

describe('Wedlocks Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    w = new WedlockService('http://notareal.host')
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
