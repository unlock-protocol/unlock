const request = require('supertest')
const sigUtil = require('eth-sig-util')
const ethJsUtil = require('ethereumjs-util')
const app = require('../../src/app')
const models = require('../../src/models')
const UserOperations = require('../../src/operations/userOperations')
const Base64 = require('../../src/utils/base64')

let User = models.User
let UserReference = models.UserReference
let privateKey = ethJsUtil.toBuffer(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

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
    message: message,
  }
}

afterEach(async () => {
  await User.truncate({ cascade: true })
})

describe('User Controller', () => {
  describe('user creation', () => {
    let message = {
      user: {
        emailAddress: 'user@example.com',
        publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      },
    }
    let typedData = generateTypedData(message)

    describe('when a user matching the public key does not exist', () => {
      it('creates the appropriate records', async () => {
        expect.assertions(3)

        let response = await request(app)
          .post('/users')
          .set('Accept', /json/)
          .send(typedData)
        expect(response.statusCode).toBe(200)
        expect(
          await User.count({
            where: { publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2' },
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
          .send(typedData)

        expect(response.statusCode).toBe(200)
      })
    })

    describe('when there is an attempt to associate an email address with an existing public key', () => {
      it('will respond as if the user was created', async () => {
        expect.assertions(1)

        let message = {
          user: {
            emailAddress: 'rejected-user@example.com',
            publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
            passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
          },
        }

        let typedData = generateTypedData(message)
        const sig = sigUtil.signTypedData(privateKey, {
          data: typedData,
        })

        let response = await request(app)
          .post('/users')
          .set('Accept', /json/)
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

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
        }

        await UserOperations.createUser(userCreationDetails)
        let response = await request(app).get(
          '/users/user@example.com/recoveryphrase'
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
  })

  describe("retrieving a user's card details ", () => {
    it("return the user's card details available", async () => {
      expect.assertions(1)
      UserOperations.getCards = jest.fn()

      await request(app).get('/users/user@example.com/cards')
      expect(UserOperations.getCards).toHaveBeenCalledWith('user@example.com')
    })
  })

  describe("updating a user's email address", () => {
    let message = {
      user: {
        emailAddress: 'new-email-address@example.com',
        publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      },
    }

    let typedData = generateTypedData(message)

    const sig = sigUtil.signTypedData(privateKey, {
      data: typedData,
    })

    describe('when able to update the email address', () => {
      it('updates the email address of the user', async () => {
        expect.assertions(2)
        let emailAddress = 'user@example.com'
        let userCreationDetails = {
          emailAddress: emailAddress,
          publicKey: 'a public key',
          passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
        }

        await UserOperations.createUser(userCreationDetails)

        let response = await request(app)
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
        let response = await request(app)
          .put('/users/non-existing@example.com')
          .set('Accept', /json/)
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)
        expect(response.statusCode).toBe(400)
      })
    })
  })

  describe("updating a user's password encrypted private key", () => {
    let message = {
      user: {
        emailAddress: 'user@example.com',
        publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        passwordEncryptedPrivateKey: '{"data" : "New Encrypted Password"}',
      },
    }

    let typedData = generateTypedData(message)
    const sig = sigUtil.signTypedData(privateKey, {
      data: typedData,
    })

    it('updates the password encrypted private key of the user', async () => {
      expect.assertions(2)
      let emailAddress = 'user@example.com'
      let userCreationDetails = {
        emailAddress: emailAddress,
        publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(userCreationDetails)

      let response = await request(app)
        .put(
          '/users/0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2/passwordEncryptedPrivateKey'
        )
        .set('Accept', /json/)
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      let user = await User.findOne({
        where: { publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2' },
      })

      expect(user.passwordEncryptedPrivateKey).toEqual(
        '{"data" : "New Encrypted Password"}'
      )
      expect(response.status).toBe(202)
    })
  })

  describe("updating a user's payment details", () => {
    beforeAll(() => {
      jest.unmock('../../src/operations/userOperations')

      UserOperations.updatePaymentDetails = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
    })

    afterAll(() => {
      jest.clearAllMocks()
    })

    describe("when able to update the user's payment details", () => {
      it('returns 202', async () => {
        expect.assertions(1)
        let response = await request(app)
          .put('/users/user@example.com/paymentdetails')
          .set('Accept', /json/)
          .send({
            message: {
              user: {
                publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
                stripeTokenId: 'tok_visa',
              },
            },
          })

        expect(response.statusCode).toBe(202)
      })
    })
    describe("when unable to update the user's payment details", () => {
      it('returns 400', async () => {
        expect.assertions(1)
        let response = await request(app)
          .put('/users/user@example.com/paymentdetails')
          .set('Accept', /json/)
          .send({
            message: {
              user: {
                publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
                stripeTokenId: 'tok_INVALID',
              },
            },
          })
        expect(response.statusCode).toBe(400)
      })
    })
  })
})
