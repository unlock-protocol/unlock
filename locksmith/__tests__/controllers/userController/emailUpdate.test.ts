import { ethers } from 'ethers'

import models = require('../../../src/models')
import app = require('../../../src/app')
import UserOperations = require('../../../src/operations/userOperations')
import Base64 = require('../../../src/utils/base64')

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
  const { User } = models
  const { UserReference } = models

  return Promise.all([
    UserReference.truncate({ cascade: true }),
    User.truncate({ cascade: true }),
  ])
})

describe("updating a user's email address", () => {
  const { UserReference } = models
  const request = require('supertest')
  const wallet = new ethers.Wallet(
    '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
  )

  const message = {
    user: {
      emailAddress: 'new-email-address@example.com',
      publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
      passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
    },
  }

  const typedData = generateTypedData(message)

  const { domain, types } = typedData

  describe('when able to update the email address', () => {
    it('updates the email address of the user', async () => {
      expect.assertions(2)
      const emailAddress = 'user@example.com'
      const userCreationDetails = {
        emailAddress,
        publicKey: 'an_email_update_public_key',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }
      await UserOperations.createUser(userCreationDetails)

      const sig = await wallet._signTypedData(domain, types, message)

      const response = await request(app)
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

      const sig = await wallet._signTypedData(domain, types, message)

      const response = await request(app)
        .put('/users/non-existing@example.com')
        .set('Accept', /json/)
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)
      expect(response.statusCode).toBe(400)
    })
  })

  describe('when the account has been ejected', () => {
    it('returns 404', async () => {
      expect.assertions(1)

      const emailAddress = 'ejected_user@example.com'
      const userCreationDetails = {
        emailAddress,
        publicKey: 'ejected_user_phrase_public_key',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(userCreationDetails)
      await UserOperations.eject(userCreationDetails.publicKey)

      const sig = await wallet._signTypedData(domain, types, message)

      const response = await request(app)
        .put('/users/ejected_user@example.com')
        .set('Accept', /json/)
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.statusCode).toBe(404)
    })
  })
})
