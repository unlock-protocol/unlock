import models = require('../../../src/models')
import app = require('../../../src/app')
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
  let User = models.User
  let UserReference = models.UserReference

  return Promise.all([
    User.truncate({ cascade: true }),
    UserReference.truncate({ cascade: true }),
  ])
})

describe('user creation', () => {
  const request = require('supertest')
  const sigUtil = require('eth-sig-util')
  const ethJsUtil = require('ethereumjs-util')

  let privateKey = ethJsUtil.toBuffer(
    '0x68eec585ce3c13bf0cbe407cb05cd2679cb829fe350471846c9a8aa2ea85b6ac'
  )

  let message = {
    user: {
      emailAddress: 'user@example.com',
      publicKey: '0xc167cCe31C1e3CfF90726eEe096299De043c5f4d',
      passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
    },
  }
  let typedData = generateTypedData(message)

  describe('when a user matching the public key does not exist', () => {
    let models = require('../../../src/models')
    let User = models.User
    let UserReference = models.UserReference

    it('creates the appropriate records', async () => {
      expect.assertions(3)

      let response = await request(app)
        .post('/users')
        .set('Accept', /json/)
        .send(typedData)
      expect(response.statusCode).toBe(200)
      expect(
        await User.count({
          where: { publicKey: '0xc167cCe31C1e3CfF90726eEe096299De043c5f4d' },
        })
      ).toEqual(1)

      expect(
        await UserReference.count({
          where: { emailAddress: 'user@example.com' },
        })
      ).toEqual(1)
    })
  })

  describe('when a user matching the public key does exist', () => {
    it('will return a 400', async () => {
      expect.assertions(1)

      let response = await request(app)
        .post('/users')
        .set('Accept', /json/)
        .send(typedData)

      expect(response.statusCode).toBe(400)
    })
  })

  describe('when there is an attempt to associate an email address with an existing public key', () => {
    it('will return a 400 error', async () => {
      expect.assertions(1)

      let message = {
        user: {
          emailAddress: 'rejected-user@example.com',
          publicKey: '0xc167cCe31C1e3CfF90726eEe096299De043c5f4d',
          passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
        },
      }

      let typedData = generateTypedData(message)
      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })

      let response = await request(app)
        .post('/users')
        .set('Accept', /json/)
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.statusCode).toBe(400)
    })
  })
})
