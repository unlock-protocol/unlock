const request = require('supertest')
const app = require('../../src/app')
const models = require('../../src/models')
const UserOperations = require('../../src/operations/userOperations')

let User = models.User
let UserReference = models.UserReference

afterEach(async () => {
  await User.truncate({ cascade: true })
})

describe('User Controller', () => {
  describe('user creation', () => {
    describe('when a user matching the public key does not exist', () => {
      it('creates the appropriate records', async () => {
        expect.assertions(3)
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
      it('will respond as if the user was created', async () => {
        expect.assertions(1)
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
      })
    })

    describe('when there is an attempt to associate an email address with an existing public key', () => {
      it('will respond as if tghe user was created', async () => {
        expect.assertions(1)
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

        expect(response.statusCode).toBe(200)
      })
    })
  })

  describe('encrypted private key retrevial', () => {
    describe('when the provided email exists in the persistence layer', () => {
      it('returns the relevant encrypted private key', async () => {
        expect.assertions(1)
        let emailAddress = 'existing@example.com'
        let userCreationDetails = {
          emailAddress: emailAddress,
          publicKey: 'a public key',
          passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
          recoveryPhrase: 'a recovery phrase',
        }

        await UserOperations.createUser(userCreationDetails)

        let response = await request(app).get(
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
        let emailAddress = 'non-existing@example.com'
        let response = await request(app).get(
          `/users/${emailAddress}/privatekey`
        )

        let passwordEncryptedPrivateKey = JSON.parse(
          response.body.passwordEncryptedPrivateKey
        )

        expect(passwordEncryptedPrivateKey).toHaveProperty('address')
        expect(passwordEncryptedPrivateKey).toHaveProperty('id')
        expect(passwordEncryptedPrivateKey).toHaveProperty('version')
      })
    })
  })

  describe("retrieving a user's recovery phrase", () => {
    describe('when the user exists', () => {
      it("returns the user's recovery phrase", async () => {
        expect.assertions(1)
        let emailAddress = 'user@example.com'
        let userCreationDetails = {
          emailAddress: emailAddress,
          publicKey: 'a public key',
          passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
          recoveryPhrase: 'a recovery phrase',
        }

        await UserOperations.createUser(userCreationDetails)
        let response = await request(app).get(
          '/users/user@example.com/recoveryphrase'
        )
        expect(response.body).toEqual({ recoveryPhrase: 'a recovery phrase' })
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
  })

  describe("updating a user's email address", () => {
    describe('when able to update the email address', () => {
      it('updates the email address of the user', async () => {
        expect.assertions(2)
        let emailAddress = 'user@example.com'
        let userCreationDetails = {
          emailAddress: emailAddress,
          publicKey: 'a public key',
          passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
          recoveryPhrase: 'a recovery phrase',
        }

        await UserOperations.createUser(userCreationDetails)

        let response = await request(app)
          .put('/users/user@example.com')
          .set('Accept', /json/)
          .send({
            user: {
              emailAddress: 'new-email-address@example.com',
            },
          })

        expect(response.statusCode).toBe(202)
        expect(
          await UserReference.count({
            where: { emailAddress: 'new-email-address@example.com' },
          })
        ).toEqual(1)
      })
    })

    describe('when unable ot update the email address', () => {
      it('returns 400', async () => {
        expect.assertions(1)
        let response = await request(app)
          .put('/users/non-existing@example.com')
          .set('Accept', /json/)
          .send({
            user: {
              emailAddress: 'new-email-address@example.com',
            },
          })

        expect(response.statusCode).toBe(400)
      })
    })
  })
})
