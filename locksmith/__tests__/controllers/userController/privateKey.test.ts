import models = require('../../../src/models')
import app = require('../../../src/app')
import UserOperations = require('../../../src/operations/userOperations')

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
  return UserReference.truncate({ cascade: true })
})

describe('encrypted private key retrevial', () => {
  const request = require('supertest')

  describe('when the provided email exists in the persistence layer', () => {
    it('returns the relevant encrypted private key', async () => {
      expect.assertions(1)
      let emailAddress = 'existing@example.com'

      let userCreationDetails = {
        emailAddress: emailAddress,
        publicKey: '0x6635f83421bf059cd8111f180f0727128685bae4',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
        recoveryPhrase: 'a recovery phrase',
      }

      await UserOperations.createUser(userCreationDetails)

      let response = await request(app).get(`/users/${emailAddress}/privatekey`)

      expect(response.body).toEqual({
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      })
    })
  })

  describe('when the provided email does not exist within the existing persistence layer', () => {
    it('returns details from the decoy user', async () => {
      expect.assertions(3)
      let emailAddress = 'non-existing@example.com'
      let response = await request(app).get(`/users/${emailAddress}/privatekey`)

      let passwordEncryptedPrivateKey = JSON.parse(
        response.body.passwordEncryptedPrivateKey
      )

      expect(passwordEncryptedPrivateKey).toHaveProperty('address')
      expect(passwordEncryptedPrivateKey).toHaveProperty('id')
      expect(passwordEncryptedPrivateKey).toHaveProperty('version')
    })
  })
})
