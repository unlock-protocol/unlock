import models = require('../../../src/models')
import app = require('../../../src/app')
import UserOperations = require('../../../src/operations/userOperations')

// These tests are slow because we generate private keys
jest.setTimeout(15000)

beforeAll(() => {
  const { UserReference } = models
  const { User } = models

  return Promise.all([
    UserReference.truncate({ cascade: true }),
    User.truncate({ cascade: true }),
  ])
})

describe('encrypted private key retrevial', () => {
  const request = require('supertest')

  describe('when the provided email exists in the persistence layer', () => {
    it('returns the relevant encrypted private key', async () => {
      expect.assertions(1)
      const emailAddress = 'existing@example.com'

      const userCreationDetails = {
        emailAddress,
        publicKey: '0x6635f83421bf059cd8111f180f0727128685bae4',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
        recoveryPhrase: 'a recovery phrase',
      }

      await UserOperations.createUser(userCreationDetails)

      const response = await request(app).get(
        `/users/${emailAddress}/privatekey`
      )

      expect(response.body).toEqual({
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      })
    })
  })

  describe('when the provided email does not exist within the existing persistence layer', () => {
    it('returns details from the decoy user', async () => {
      expect.assertions(3)
      const emailAddress = 'non-existing@example.com'
      const response = await request(app).get(
        `/users/${emailAddress}/privatekey`
      )

      const passwordEncryptedPrivateKey = JSON.parse(
        response.body.passwordEncryptedPrivateKey
      )

      expect(passwordEncryptedPrivateKey).toHaveProperty('address')
      expect(passwordEncryptedPrivateKey).toHaveProperty('id')
      expect(passwordEncryptedPrivateKey).toHaveProperty('version')
    })
  })

  describe('when the account has been ejected', () => {
    it('returns a 404', async () => {
      expect.assertions(1)
      const emailAddress = 'ejected_user@example.com'
      const userCreationDetails = {
        emailAddress,
        publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(userCreationDetails)
      await UserOperations.eject(userCreationDetails.publicKey)

      const response = await request(app).get(
        `/users/${emailAddress}/privatekey`
      )
      expect(response.statusCode).toEqual(404)
    })
  })
})
