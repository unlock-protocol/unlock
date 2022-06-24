import { ethers } from 'ethers'

import models = require('../../../src/models')

function generateTypedData(message: any, messageKey: string) {
  return {
    types: {
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
    messageKey,
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
  const app = require('../../../src/app')

  const UserOperations = require('../../../src/operations/userOperations')
  const Base64 = require('../../../src/utils/base64')

  const wallet = new ethers.Wallet(
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

    const typedData = generateTypedData(message, 'user')

    const { domain, types } = typedData

    it('updates the password encrypted private key of the user', async () => {
      expect.assertions(2)

      const emailAddress = 'user@example.com'

      const userCreationDetails = {
        emailAddress,
        publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(userCreationDetails)

      const sig = await wallet._signTypedData(domain, types, message['user'])

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
        publicKey: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(user)
      await UserOperations.eject(user.publicKey)

      const message = {
        user,
      }

      const typedData = generateTypedData(message, 'user')

      const { domain, types } = typedData
      const sig = await wallet._signTypedData(domain, types, message['user'])

      const response = await request(app)
        .put(`/users/${user.publicKey}/passwordEncryptedPrivateKey`)
        .set('Accept', /json/)
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toBe(404)
    })
  })
})
