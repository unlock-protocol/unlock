import request from 'supertest'

import models = require('../../../src/models')
import app = require('../../../src/app')
import UserOperations = require('../../../src/operations/userOperations')

beforeAll(() => {
  let UserReference = models.UserReference
  return UserReference.truncate({ cascade: true })
})

describe('when ejecting an address', () => {
  describe('when the address exists', () => {
    it('returns 202', async () => {
      expect.assertions(1)

      let emailAddress = 'existing@example.com'
      let userCreationDetails = {
        emailAddress: emailAddress,
        publicKey: '0xd8fdbf2302b13d4cf00bac1a25efb786759c7788',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
        recoveryPhrase: 'a recovery phrase',
      }

      await UserOperations.createUser(userCreationDetails)

      let response = await request(app).post(
        '/users/0xD8fDbF2302b13d4CF00BAC1a25EFb786759c7788/eject'
      )

      expect(response.status).toBe(202)
    })
  })

  describe("when the address doesn't exit", () => {
    it('returns 400', async () => {
      expect.assertions(1)

      let response = await request(app).post(
        '/users/0xef49773e0d59f607cea8c8be4ce87bd26fd8e208/eject'
      )

      expect(response.status).toBe(400)
    })
  })
})
