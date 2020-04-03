import request from 'supertest'

import app = require('../../../src/app')
import Base64 = require('../../../src/utils/base64')
import ethJsUtil = require('ethereumjs-util')
import models = require('../../../src/models')
import sigUtil = require('eth-sig-util')
import UserOperations = require('../../../src/operations/userOperations')

const emailAddress = 'existing@example.com'

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
      User: [{ name: 'publicKey', type: 'address' }],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'User',
    message,
  }
}

beforeAll(async () => {
  const userCreationDetails = {
    emailAddress,
    publicKey: '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a',
    passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
    recoveryPhrase: 'a recovery phrase',
  }

  await UserOperations.createUser(userCreationDetails)
})

afterAll(async () => {
  const { User } = models
  const { UserReference } = models

  return Promise.all([
    User.truncate({ cascade: true }),
    UserReference.truncate({ cascade: true }),
  ])
})

describe('when requesting cards', () => {
  describe('when the request does not include a signature', () => {
    it('returns a 401', async () => {
      expect.assertions(1)

      const response = await request(app).get(`/users/${emailAddress}/cards`)
      expect(response.status).toBe(401)
    })
  })

  describe('when the request includes a signature that does not match the public address', () => {
    it('returns a 401', async () => {
      expect.assertions(1)

      const message = {
        user: {
          publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        },
      }

      const privateKey = ethJsUtil.toBuffer(
        '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
      )

      const typedData = generateTypedData(message)
      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })

      const response = await request(app)
        .get(`/users/${emailAddress}/cards`)
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)

      expect(response.status).toBe(401)
    })
  })

  describe('when a valid signature is provided', () => {
    it('returns the request cards', async () => {
      expect.assertions(1)

      const message = {
        user: {
          publicKey: '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a',
        },
      }

      const privateKey = ethJsUtil.toBuffer(
        '0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61'
      )

      const typedData = generateTypedData(message)
      const sig = sigUtil.personalSign(privateKey, {
        data: JSON.stringify(typedData),
      })

      const response = await request(app)
        .get(`/users/${emailAddress}/cards`)
        .set('Authorization', `Bearer-Simple ${Base64.encode(sig)}`)
        .query({ data: JSON.stringify(typedData) })

      expect(response.status).toBe(200)
    })
  })
})
