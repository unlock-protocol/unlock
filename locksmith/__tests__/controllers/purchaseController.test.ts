import request from 'supertest'
import * as sigUtil from 'eth-sig-util'

const ethJsUtil = require('ethereumjs-util')
const app = require('../../src/app')
const Base64 = require('../../src/utils/base64')
const models = require('../../src/models')

const { AuthorizedLock } = models
const participatingLock = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'
const nonParticipatingLock = '0xF4906CE8a8E861339F75611c129b9679EDAe7bBD'
const recipient = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

const privateKey = ethJsUtil.toBuffer(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)
const mockPaymentProcessor = {
  chargeUser: jest.fn().mockResolvedValue('true'),
  initiatePurchase: jest.fn().mockResolvedValue('this is a transaction hash'),
  initiatePurchaseForConnectedStripeAccount: jest.fn().mockResolvedValue(''),
}

const keyPricer = {
  keyPriceUSD: jest.fn().mockReturnValueOnce(250).mockReturnValueOnce(1000000),
}

const chain = 1984

function generateTypedData(message: any) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
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
  beforeAll(async () => {
    await AuthorizedLock.create({
      chain,
      address: participatingLock,
    })
  })

  afterAll(async () => {
    await AuthorizedLock.truncate()
  })

  describe('purchase initiation', () => {
    describe("when the purchase hasn't been signed correctly", () => {
      it('returns a 401 status code', async () => {
        expect.assertions(1)
        const response = await request(app).post('/purchase')
        expect(response.status).toBe(401)
      })
    })

    describe('when the purchase request is appropriately signed and user has payment details', () => {
      const message = {
        purchaseRequest: {
          recipient,
          lock: participatingLock,
          expiry: 16733658026,
        },
      }

      const typedData = generateTypedData(message)

      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })

      it('responds with a 200 and transaction hash', async () => {
        expect.assertions(3)

        const response = await request(app)
          .post('/purchase')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toBe(200)
        expect(response.body).toEqual({
          transactionHash: 'this is a transaction hash',
        })
        expect(mockPaymentProcessor.initiatePurchase).toHaveBeenCalled()
      })
    })

    describe('when the purchase request is past its expiry window', () => {
      const message = {
        purchaseRequest: {
          recipient,
          lock: participatingLock,
          expiry: 702764221,
        },
      }

      const typedData = generateTypedData(message)

      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })
      it('responds with a 412', async () => {
        expect.assertions(1)
        const response = await request(app)
          .post('/purchase')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)
        expect(response.status).toBe(412)
      })
    })

    describe('when the Lock has not been authorized for participation in the purchasing program', () => {
      const message = {
        purchaseRequest: {
          recipient,
          lock: nonParticipatingLock,
          expiry: 16733658026,
        },
      }

      const typedData = generateTypedData(message)
      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })
      it('rejects the purchase', async () => {
        expect.assertions(1)
        const response = await request(app)
          .post('/purchase')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)
        expect(response.status).toBe(451)
      })
    })
  })

  describe('purchase in USD initiation', () => {
    describe("when the purchase hasn't been signed correctly", () => {
      it('returns a 401 status code', async () => {
        expect.assertions(1)
        const response = await request(app).post('/purchase/USD')
        expect(response.status).toBe(401)
      })
    })

    describe('when the purchase request is appropriately signed and user has payment details', () => {
      const message = {
        purchaseRequest: {
          recipient,
          lock: participatingLock,
          expiry: 16733658026,
          USDAmount: 250,
        },
      }

      const typedData = generateTypedData(message)

      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })

      describe('when the requested price is within the valid range of drift', () => {
        it('responds with a 200 status code', async () => {
          expect.assertions(1)

          const response = await request(app)
            .post('/purchase/USD')
            .set('Accept', 'json')
            .set('Authorization', `Bearer ${Base64.encode(sig)}`)
            .send(typedData)

          expect(response.status).toBe(200)
        })
      })

      describe('when the requested price is outside of the valid range of drift', () => {
        it('responds with a 417 status code', async () => {
          expect.assertions(1)

          const response = await request(app)
            .post('/purchase/USD')
            .set('Accept', 'json')
            .set('Authorization', `Bearer ${Base64.encode(sig)}`)
            .send(typedData)

          expect(response.status).toBe(417)
        })
      })
    })
  })

  describe('when the purchase request is past its expiry window', () => {
    const message = {
      purchaseRequest: {
        recipient,
        lock: participatingLock,
        expiry: 702764221,
        USDAmount: 250,
      },
    }

    const typedData = generateTypedData(message)

    const sig = sigUtil.signTypedData(privateKey, {
      data: typedData,
    })
    it('responds with a 412', async () => {
      expect.assertions(1)
      const response = await request(app)
        .post('/purchase')
        .set('Accept', 'json')
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)
      expect(response.status).toBe(412)
    })
  })
})
