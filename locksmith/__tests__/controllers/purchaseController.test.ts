import { ethers } from 'ethers'
import request from 'supertest'

const app = require('../../src/app')
const Base64 = require('../../src/utils/base64')

const participatingLock = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'
const recipient = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

const wallet = new ethers.Wallet(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)
// eslint-disable-next-line
var mockPaymentProcessor = {
  chargeUser: jest.fn().mockResolvedValue('true'),
  initiatePurchase: jest.fn().mockResolvedValue('this is a transaction hash'),
  initiatePurchaseForConnectedStripeAccount: jest.fn().mockResolvedValue(''),
}

const keyPricer = {
  keyPriceUSD: jest.fn().mockReturnValueOnce(250).mockReturnValueOnce(1000000),
}
function generateTypedData(message: any, messageKey: string) {
  return {
    types: {
      PurchaseRequest: [
        { name: 'recipient', type: 'address' },
        { name: 'lock', type: 'address' },
        { name: 'expiry', type: 'uint64' },
        { name: 'USDAmount', type: 'uint64' },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'PurchaseRequest',
    message,
    messageKey,
  }
}

jest.mock('../../src/payment/paymentProcessor', () => {
  return jest.fn().mockImplementation(() => {
    return mockPaymentProcessor
  })
})

jest.mock('../../src/utils/keyPricer', () => {
  return jest.fn().mockImplementation(() => {
    return keyPricer
  })
})

describe('Purchase Controller', () => {
  describe('purchase in USD initiation', () => {
    describe('when the purchase request is appropriately signed and user has payment details', () => {
      const message = {
        purchaseRequest: {
          recipient,
          lock: participatingLock,
          expiry: 16733658026,
          USDAmount: 250,
        },
      }

      const typedData = generateTypedData(message, 'purchaseRequest')

      it('responds with a 200 status code', async () => {
        expect.assertions(1)

        const { domain, types } = typedData
        const sig = await wallet._signTypedData(
          domain,
          types,
          message.purchaseRequest
        )

        const response = await request(app)
          .post('/purchase/USD')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toBe(200)
      })
    })
  })
})
