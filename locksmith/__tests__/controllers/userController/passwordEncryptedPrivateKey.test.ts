import models = require('../../../src/models')

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
    message,
  }
}

beforeAll(() => {
  const { UserReference } = models
  const { User } = models

  return Promise.all([
    UserReference.truncate({ cascade: true }),
    User.truncate({ cascade: true }),
  ])
})

describe("updating a user's password encrypted private key", () => {
  const models = require('../../../src/models')
  const { User } = models
  const request = require('supertest')
  const sigUtil = require('eth-sig-util')
  const ethJsUtil = require('ethereumjs-util')
  const app = require('../../../src/app')

  const UserOperations = require('../../../src/operations/userOperations')
  const Base64 = require('../../../src/utils/base64')

  const privateKey = ethJsUtil.toBuffer(
    '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
  )

  describe('when the account is active', () => {
    const message = {
      user: {
        emailAddress: 'user@example.com',
        publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        passwordEncryptedPrivateKey: '{"data" : "New Encrypted Password"}',
      },
    }

    const typedData = generateTypedData(message)
    const sig = sigUtil.signTypedData(privateKey, {
      data: typedData,
    })

    it('updates the password encrypted private key of the user', async () => {
      expect.assertions(2)

      const emailAddress = 'user@example.com'

      const userCreationDetails = {
        emailAddress,
        publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(userCreationDetails)

      const response = await request(app)
        .put(
          '/users/0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2/passwordEncryptedPrivateKey'
        )
        .set('Accept', /json/)
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      const user = await User.findOne({
        where: { publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2' },
      })

      expect(user.passwordEncryptedPrivateKey).toEqual(
        '{"data" : "New Encrypted Password"}'
      )
      expect(response.status).toBe(202)
    })
  })

  describe('when the account has been ejected', () => {
    it('returns a 404', async () => {
      expect.assertions(1)
      const emailAddress = 'ejected_user@example.com'
      const user = {
        emailAddress,
        publicKey: 'ejected_user_phrase_public_key',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(user)
      await UserOperations.eject(user.publicKey)

      const message = {
        user,
      }

      const typedData = generateTypedData(message)
      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })

      const response = await request(app)
        .put(`/users/${user.publicKey}/passwordEncryptedPrivateKey`)
        .set('Accept', /json/)
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toBe(404)
    })
  })
})
