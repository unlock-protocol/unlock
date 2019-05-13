import request from 'supertest'
import sigUtil from 'eth-sig-util'
import { Web3Service } from '@unlock-protocol/unlock-js'

const ethJsUtil = require('ethereumjs-util')
const app = require('../../src/app')
const Base64 = require('../../src/utils/base64')
const models = require('../../src/models')

let AuthorizedLock = models.AuthorizedLock
let participatingLock = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'
let nonParticipatingLock = '0xF4906CE8a8E861339F75611c129b9679EDAe7bBD'

let privateKey = ethJsUtil.toBuffer(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)
let mockPaymentProcessor = {
  chargeUser: jest.fn(),
  initiatePurchase: jest.fn(),
}

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
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'PurchaseRequest',
    message: message,
  }
}

describe('Purchase Controller', () => {
  beforeAll(async () => {
    await AuthorizedLock.create({
      address: participatingLock,
    })
  })

  beforeEach(() => {
    jest.mock('../../src/payment/paymentProcessor', () => {
      return jest.fn().mockImplementation(() => {
        return mockPaymentProcessor
      })
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  afterAll(async () => {
    await AuthorizedLock.truncate()
  })

  describe('purchase initiation', () => {
    describe("when the purchase hasn't been signed correctly", () => {
      it('returns a 401 status code', async () => {
        expect.assertions(1)
        let response = await request(app).post('/purchase')
        expect(response.status).toBe(401)
      })
    })

    describe('when the purchase request is appropriately signed', () => {
      let message = {
        purchaseRequest: {
          recipient: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
          lock: participatingLock,
          expiry: 16733658026,
        },
      }

      let typedData = generateTypedData(message)

      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })

      it.skip('responds with a 202', async () => {
        expect.assertions(2)

        let w3s = new Web3Service({
          readOnlyProvider: 'http://127.0.0.1:8545',
          unlockAddress: '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93',
          blockTime: 40,
          requiredConfirmations: 0,
        })

        let response = await request(app)
          .post('/purchase')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toBe(202)

        /** the transaction is dispatched but may not be mined when this is called*/

        let ownedKey = await w3s.getKeyByLockForOwner(
          participatingLock,
          '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
        )

        expect(ownedKey.expiration).not.toBe(0)
      })
    })

    describe('when the purchase request is past its expiry window', () => {
      let message = {
        purchaseRequest: {
          recipient: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
          lock: participatingLock,
          expiry: 702764221,
        },
      }

      let typedData = generateTypedData(message)

      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })
      it('responds with a 412', async () => {
        expect.assertions(1)
        let response = await request(app)
          .post('/purchase')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)
        expect(response.status).toBe(412)
      })
    })

    describe('when the Lock has not been authorized for participation in the purchasing program', () => {
      let message = {
        purchaseRequest: {
          recipient: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
          lock: nonParticipatingLock,
          expiry: 16733658026,
        },
      }

      let typedData = generateTypedData(message)
      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })
      it('rejects the purchase', async () => {
        expect.assertions(1)
        let response = await request(app)
          .post('/purchase')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)
        expect(response.status).toBe(451)
      })
    })
  })
})
