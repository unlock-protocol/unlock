import request from 'supertest'
import app from '../../app'
import config from '../../../src/config/config'
import { vi, expect } from 'vitest'

// Constants defining the parameters for the Google Wallet pass generation
const network = 11155111
const lockAddress = '0xe6314d3eD5590F2339C57B3011ADC27971D5EadB'
const keyId = '1'

// Mock configuration specific to Google Wallet API interaction
const mockGoogleConfig = {
  googleWalletApplicationCredentials: {
    client_email: 'test@example.com',
    private_key: 'test_private_key',
  },
  googleWalletIssuerID: 'issuer_id',
  googleWalletClass: 'wallet_class',
}

// config with Google Wallet specifics
config.googleWalletApplicationCredentials =
  mockGoogleConfig.googleWalletApplicationCredentials
config.googleWalletIssuerID = mockGoogleConfig.googleWalletIssuerID
config.googleWalletClass = mockGoogleConfig.googleWalletClass

// Mock implementations for dependent services
vi.mock('../../../src/operations/metadataOperations', () => ({
  getLockMetadata: vi.fn(() => ({
    name: 'Test Lock',
    description:
      'Keys minted from this test lock can be saved to your device as a Google Wallet pass.',
    image:
      'https://staging-locksmith.unlock-protocol.com/lock/0xe6314d3eD5590F2339C57B3011ADC27971D5EadB/icon',
    attributes: [],
    external_url: null,
  })),
}))

// Mock for generating QR code URL
vi.mock('../../../src/utils/qrcode', () => ({
  generateQrCodeUrl: vi.fn(() => 'https://example.com/qr'),
}))

// Mock for ensuring a wallet class exists or creating one
vi.mock(
  '../../../src/operations/generate-pass/android/passClassService',
  () => ({
    getOrCreateWalletClass: vi.fn(() => 'issuer_id.wallet_class'),
  })
)

// Mock for creating the wallet pass object
vi.mock(
  '../../../src/operations/generate-pass/android/createPassObject',
  () => ({
    createWalletPassObject: vi.fn(() => 'https://example.com/pass'),
  })
)

// tesst suite for Google Wallet pass generation
describe("Generate a Google Wallet pass for a lock's key", () => {
  it('should return a response status of 200 and the URL to save the generated wallet pass', async () => {
    // number of assertions expected
    expect.assertions(2)

    // execute the request to the Google Wallet pass generation endpoint
    const generateGoogleWalletPassResponse = await request(app).get(
      `/v2/pass/${network}/${lockAddress}/${keyId}/android`
    )

    // Assert the HTTP status code to be 200 (OK)
    expect(generateGoogleWalletPassResponse.status).toBe(200)
    // Assert the response body to contain the pass URL
    expect(generateGoogleWalletPassResponse.body).toEqual({
      passObjectUrl: 'https://example.com/pass',
    })
  })
})
