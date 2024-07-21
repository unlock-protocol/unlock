import jwt from 'jsonwebtoken'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import config from '../../config/config'
import { createWalletPassObject } from '../../src/operations/generate-pass/android/createPassObject'

vi.mock('jsonwebtoken')
vi.mock('../../../config/config')
vi.mock('../../../logger')

describe('createWalletPassObject', () => {
  // define mock configuration
  const mockConfig = {
    googleWalletApplicationCredentials: {
      client_email: 'test@example.com',
      private_key: 'test_private_key',
    },
  }

  beforeEach(() => {
    config.googleWalletApplicationCredentials =
      mockConfig.googleWalletApplicationCredentials
    // Mock the jwt.sign method to return a fixed token
    vi.mocked(jwt.sign).mockImplementation(() => 'mocked_token')
  })

  it('should create a valid save URL', async () => {
    // Define input parameters for the createWalletPassObject function
    const classId = 'testClassId'
    const lockName = 'testLockName'
    const networkName = 'testNetworkName'
    const lockAddress = 'testLockAddress'
    const keyId = 'testKeyId'
    const qrCodeUrl = 'https://example.com/qrcode'

    const saveUrl = await createWalletPassObject(
      classId,
      lockName,
      networkName,
      lockAddress,
      keyId,
      qrCodeUrl,
      mockConfig.googleWalletApplicationCredentials.client_email,
      mockConfig.googleWalletApplicationCredentials.private_key
    )

    // Assert that the returned save URL matches the expected URL
    expect(saveUrl).toBe(`https://pay.google.com/gp/v/save/mocked_token`)

    // Ensure jwt.sign was called with the correct parameters
    expect(jwt.sign).toHaveBeenCalledWith(
      {
        iss: mockConfig.googleWalletApplicationCredentials.client_email,
        aud: 'google',
        origins: [],
        typ: 'savetowallet',
        payload: {
          genericObjects: [
            {
              id: `${classId}.${keyId}`,
              classId: classId,
              hexBackgroundColor: '#fffcf6',
              logo: {
                sourceUri: {
                  uri: 'https://raw.githubusercontent.com/unlock-protocol/unlock/master/design/logo/%C9%84nlock-Logo-monogram-black.png',
                },
                contentDescription: {
                  defaultValue: {
                    language: 'en-US',
                    value: 'LOGO_IMAGE_DESCRIPTION',
                  },
                },
              },
              cardTitle: {
                defaultValue: {
                  language: 'en-US',
                  value: lockName,
                },
              },
              subheader: {
                defaultValue: {
                  language: 'en-US',
                  value: 'Event',
                },
              },
              header: {
                defaultValue: {
                  language: 'en-US',
                  value: lockName,
                },
              },
              textModulesData: [
                {
                  id: 'id',
                  header: 'ID',
                  body: keyId,
                },
                {
                  id: 'network',
                  header: 'Network',
                  body: networkName,
                },
                {
                  id: 'lock_address',
                  header: 'Lock Address',
                  body: lockAddress,
                },
              ],
              barcode: {
                type: 'QR_CODE',
                value: qrCodeUrl,
                alternateText: '',
              },
            },
          ],
        },
      },
      'test_private_key',
      { algorithm: 'RS256' }
    )
  })
})
