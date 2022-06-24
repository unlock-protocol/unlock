import app = require('../../../src/app')
import UserOperations = require('../../../src/operations/userOperations')
import models = require('../../../src/models')

beforeAll(() => {
  const { UserReference } = models
  const { User } = models

  return Promise.all([
    User.truncate({ cascade: true }),
    UserReference.truncate({ cascade: true }),
  ])
})

describe("retrieving a user's recovery phrase", () => {
  const request = require('supertest')

  describe('when the user exists', () => {
    it("returns the user's recovery phrase", async () => {
      expect.assertions(1)
      const emailAddress = 'recovery_phrase_user@example.com'
      const userCreationDetails = {
        emailAddress,
        publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(userCreationDetails)

      const response = await request(app).get(
        '/users/ecovery_phrase_user@example.com/recoveryphrase'
      )
      expect(response.body.recoveryPhrase.length).toBeGreaterThan(0)
    })
  })

  describe('when the user does not exist', () => {
    it('returns details from the decoy user', async () => {
      expect.assertions(3)
      const response = await request(app).get(
        '/users/non-existing@example.com/recoveryphrase'
      )

      expect(response.body).not.toEqual({
        recoveryPhrase: 'a recovery phrase',
      })
      expect(response.body.recoveryPhrase).toBeDefined()
      expect(response.statusCode).toBe(200)
    })
  })

  describe('when the user has been ejected', () => {
    it('returns a 404', async () => {
      expect.assertions(1)

      const emailAddress = 'ejected_user@example.com'
      const userCreationDetails = {
        emailAddress,
        publicKey: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(userCreationDetails)
      await UserOperations.eject(userCreationDetails.publicKey)

      const response = await request(app).get(
        `/users/${emailAddress}/recoveryphrase`
      )

      expect(response.statusCode).toEqual(404)
    })
  })
})
