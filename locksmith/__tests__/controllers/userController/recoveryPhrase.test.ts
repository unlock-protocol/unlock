import app = require('../../../src/app')
import UserOperations = require('../../../src/operations/userOperations')
import models = require('../../../src/models')

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

beforeAll(() => {
  let UserReference = models.UserReference
  let User = models.User

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
      let emailAddress = 'recovery_phrase_user@example.com'
      let userCreationDetails = {
        emailAddress: emailAddress,
        publicKey: 'recovery_phrase_public_key',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(userCreationDetails)

      let response = await request(app).get(
        '/users/ecovery_phrase_user@example.com/recoveryphrase'
      )
      expect(response.body.recoveryPhrase.length).toBeGreaterThan(0)
    })
  })

  describe('when the user does not exist', () => {
    it('returns details from the decoy user', async () => {
      expect.assertions(3)
      let response = await request(app).get(
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

      let emailAddress = 'ejected_user@example.com'
      let userCreationDetails = {
        emailAddress: emailAddress,
        publicKey: 'ejected_user_phrase_public_key',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(userCreationDetails)
      await UserOperations.eject(userCreationDetails.publicKey)

      let response = await request(app).get(
        `/users/${emailAddress}/recoveryphrase`
      )

      expect(response.statusCode).toEqual(404)
    })
  })
})
