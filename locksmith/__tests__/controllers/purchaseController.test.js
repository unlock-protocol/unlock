const request = require('supertest')
const ethJsUtil = require('ethereumjs-util')
const sigUtil = require('eth-sig-util')
const app = require('../../src/app')
const Base64 = require('../../src/utils/base64')

let privateKey = ethJsUtil.toBuffer(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

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
  describe('purchase initiation', () => {
    describe("when the purchase hasn't been signed correctly", () => {
      it('returns a 401 status code', async () => {
        expect.assertions(1)
        let response = await request(app).post('/purchase')
        expect(response.statusCode).toBe(401)
      })
    })

    describe('when the purchase request is appropriately signed', () => {
      let message = {
        purchaseRequest: {
          recipient: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
          lock: '0xe4906CE8a8E861339F75611c129b9679EDAe7bBD',
          expiry: 16733658026,
        },
      }

      let typedData = generateTypedData(message)

      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })
      it('responds with a 202', async () => {
        expect.assertions(1)
        let response = await request(app)
          .post('/purchase')
          .set('Accept', /json/)
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)
        expect(response.statusCode).toBe(202)
      })
    })
  })
})
