const request = require('supertest')
const app = require('../../src/app')
const models = require('../../src/models')
import UserOperations = require('../../src/operations/userOperations')

let User = models.User
let UserReference = models.UserReference

afterAll(async () => {
  await User.truncate({ cascade: true })
})

describe('User Controller', () => {
  describe('user creation', () => {
    describe('when a user matching the public key does not exist', () => {
      it('creates the appropriate records', async () => {
        let response = await request(app)
          .post('/users')
          .set('Accept', /json/)
          .send({
            user: {
              emailAddress: 'user@example.com',
              publicKey: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
              passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
              recoveryPhrase: 'a recovery phrase',
            },
          })
        expect(response.statusCode).toBe(200)
        expect(
          await User.count({
            where: { publicKey: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83' },
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
      it('will not create a new record for the existing user', async () => {
        let response = await request(app)
          .post('/users')
          .set('Accept', /json/)
          .send({
            user: {
              emailAddress: 'user@example.com',
              publicKey: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
              passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
              recoveryPhrase: 'a recovery phrase',
            },
          })

        expect(response.statusCode).toBe(400)
      })
    })

    describe('when there is an attempt to associate an email address with an existing public key', () => {
      it('will not create a new record', async () => {
        let response = await request(app)
          .post('/users')
          .set('Accept', /json/)
          .send({
            user: {
              emailAddress: 'rejected-user@example.com',
              publicKey: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
              passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
              recoveryPhrase: 'a recovery phrase',
            },
          })

        expect(response.statusCode).toBe(400)
      })
    })
  })

  describe('encrypted private key retrevial', () => {
    describe('when the provided email exists in the persistence layer', () => {
      it('returns the relevant encrypted private key', async () => {
        let emailAddress = 'existing@example.com'
        let userCreationDetails = {
          emailAddress: emailAddress,
          publicKey: 'a public key',
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

    describe('when the provided email does not within the existing persistence layer', () => {
      it('returns an error code', async () => {
        let emailAddress = 'non-existing@example.com'
        let response = await request(app).get(`/users/${emailAddress}/privatekey`)
        expect(response.statusCode).toBe(400)
      })
    })
  })
})
