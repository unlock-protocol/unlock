import { ethers } from 'ethers'

import models = require('../../../src/models')
import app = require('../../../src/app')
import Base64 = require('../../../src/utils/base64')

const UserOperations = require('../../../src/operations/userOperations')

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
  const { User } = models
  const { UserReference } = models

  return Promise.all([
    User.truncate({ cascade: true }),
    UserReference.truncate({ cascade: true }),
  ])
})

describe('user creation', () => {
  const request = require('supertest')

  const wallet = new ethers.Wallet(
    '0x68eec585ce3c13bf0cbe407cb05cd2679cb829fe350471846c9a8aa2ea85b6ac'
  )

  const message = {
    user: {
      emailAddress: 'user@example.com',
      publicKey: '0xc167cCe31C1e3CfF90726eEe096299De043c5f4d',
      passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
    },
  }
  const typedData = generateTypedData(message, 'user')

  describe('when a user matching the public key does not exist', () => {
    const models = require('../../../src/models')
    const { User } = models
    const { UserReference } = models

    it('creates the appropriate records', async () => {
      expect.assertions(3)

      const response = await request(app)
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

      const response = await request(app)
        .post('/users')
        .set('Accept', /json/)
        .send(typedData)

      expect(response.statusCode).toBe(400)
    })
  })

  describe('when there is an attempt to associate an email address with an existing public key', () => {
    it('will return a 400 error', async () => {
      expect.assertions(1)

      const message = {
        user: {
          emailAddress: 'rejected-user@example.com',
          publicKey: '0xc167cCe31C1e3CfF90726eEe096299De043c5f4d',
          passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
        },
      }

      const typedData = generateTypedData(message, 'user')

      const { domain, types } = typedData
      const sig = await wallet._signTypedData(domain, types, message['user'])

      const response = await request(app)
        .post('/users')
        .set('Accept', /json/)
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.statusCode).toBe(400)
    })
  })

  describe('when attempting to re-create a previously ejected user', () => {
    it('returns a 409', async () => {
      expect.assertions(1)

      const emailAddress = 'ejected_user@example.com'
      const userCreationDetails = {
        emailAddress,
        publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(userCreationDetails)
      await UserOperations.eject(userCreationDetails.publicKey)

      const message = {
        user: {
          emailAddress,
          publicKey: userCreationDetails.publicKey,
          passwordEncryptedPrivateKey:
            userCreationDetails.passwordEncryptedPrivateKey,
        },
      }

      const response = await request(app)
        .post('/users')
        .set('Accept', /json/)
        .send(generateTypedData(message, 'user'))
      expect(response.statusCode).toBe(409)
    })
  })
})
