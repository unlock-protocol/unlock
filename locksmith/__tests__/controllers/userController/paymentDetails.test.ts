let UserOperations = require('../../../src/operations/userOperations')

import models = require('../../../src/models')
import app = require('../../../src/app')

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
  jest.unmock('../../../src/operations/userOperations')

  let UserReference = models.UserReference
  let User = models.User

  UserOperations.updatePaymentDetails = jest
    .fn()
    .mockReturnValueOnce(true)
    .mockReturnValueOnce(false)

  return Promise.all([
    UserReference.truncate({ cascade: true }),
    User.truncate({ cascade: true }),
  ])
})

afterAll(() => {
  jest.clearAllMocks()
})

describe('payment details', () => {
  let request = require('supertest')

  describe("retrieving a user's card details ", () => {
    it("return the user's card details if available", async () => {
      expect.assertions(1)
      UserOperations.getCards = jest.fn()

      await request(app).get('/users/user@example.com/cards')
      expect(UserOperations.getCards).toHaveBeenCalledWith('user@example.com')
    })
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

  describe('when the user has been has been ejected', () => {
    it('returns 404', async () => {
      expect.assertions(1)

      let emailAddress = 'ejected_user@example.com'
      let userCreationDetails = {
        emailAddress: emailAddress,
        publicKey: 'ejected_user_phrase_public_key',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(userCreationDetails)
      await UserOperations.eject(userCreationDetails.publicKey)

      let response = await request(app)
        .put('/users/ejected_user@example.com/paymentdetails')
        .set('Accept', /json/)
        .send({
          message: {
            user: {
              publicKey: 'ejected_user_phrase_public_key',
              stripeTokenId: 'tok_RANDOM',
            },
          },
        })
      expect(response.statusCode).toBe(404)
    })
  })
})
