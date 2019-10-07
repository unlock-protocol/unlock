import models = require('../../../src/models')
import app = require('../../../src/app')
import UserOperations = require('../../../src/operations/userOperations')
import Base64 = require('../../../src/utils/base64')

jest.mock('../../../src/utils/ownedKeys', () => {
  return {
    keys: jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(['0x1234'])
      .mockResolvedValueOnce(['0x1234']),
  }
})

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
      User: [
        { name: 'emailAddress', type: 'string' },
        { name: 'publicKey', type: 'address' },
        { name: 'passwordEncryptedPrivateKey', type: 'string' },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'User',
    message: message,
  }
}

beforeAll(() => {
  let UserReference = models.UserReference
  return UserReference.truncate({ cascade: true })
})

describe("updating a user's email address", () => {
  let UserReference = models.UserReference
  const request = require('supertest')
  const sigUtil = require('eth-sig-util')
  const ethJsUtil = require('ethereumjs-util')
  let privateKey = ethJsUtil.toBuffer(
    '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
  )

  let message = {
    user: {
      emailAddress: 'new-email-address@example.com',
      publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
      passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
    },
  }

  let typedData = generateTypedData(message)

  const sig = sigUtil.signTypedData(privateKey, {
    data: typedData,
  })

  describe('when able to update the email address', () => {
    it('updates the email address of the user', async () => {
      expect.assertions(2)
      let emailAddress = 'user@example.com'
      let userCreationDetails = {
        emailAddress: emailAddress,
        publicKey: 'an_email_update_public_key',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }
      await UserOperations.createUser(userCreationDetails)

      let response = await request(app)
        .put('/users/user@example.com')
        .set('Accept', /json/)
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.statusCode).toBe(202)
      expect(
        await UserReference.count({
          where: { emailAddress: 'new-email-address@example.com' },
        })
      ).toEqual(1)
    })
  })

  describe('when unable to update the email address', () => {
    it('returns 400', async () => {
      expect.assertions(1)
      let response = await request(app)
        .put('/users/non-existing@example.com')
        .set('Accept', /json/)
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)
      expect(response.statusCode).toBe(400)
    })
  })
})
