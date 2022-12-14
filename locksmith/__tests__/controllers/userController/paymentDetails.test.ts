import request from 'supertest'
import app from '../../app'
import { User, UserReference, StripeCustomer } from '../../../src/models'
import UserOperations from '../../../src/operations/userOperations'
import { vi } from 'vitest'

beforeAll(() => {
  return Promise.all([
    StripeCustomer.truncate({ cascade: true }),
    UserReference.truncate({ cascade: true }),
    User.truncate({ cascade: true }),
  ])
})

describe('payment details', () => {
  describe("retrieving a user's card details ", () => {
    it("return the user's card details if available", async () => {
      expect.assertions(1)
      UserOperations.getCards = vi.fn()

      await request(app).get('/users/user@example.com/cards')
      expect(UserOperations.getCards).toHaveBeenCalledWith('user@example.com')
    })
  })

  describe("when able to update the user's payment details", () => {
    it('returns 202', async () => {
      expect.assertions(1)

      UserOperations.updatePaymentDetails = vi
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)

      const response = await request(app)
        .put('/users/user@example.com/paymentdetails')
        .set('Accept', 'json')
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

      UserOperations.updatePaymentDetails = vi.fn().mockReturnValueOnce(false)

      const response = await request(app)
        .put('/users/user@example.com/paymentdetails')
        .set('Accept', 'json')
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

      const emailAddress = 'ejected_user@example.com'
      const userCreationDetails = {
        emailAddress,
        publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      }

      await UserOperations.createUser(userCreationDetails)
      await UserOperations.eject(userCreationDetails.publicKey)

      const response = await request(app)
        .put('/users/ejected_user@example.com/paymentdetails')
        .set('Accept', 'json')
        .send({
          message: {
            user: {
              publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
              stripeTokenId: 'tok_RANDOM',
            },
          },
        })
      expect(response.statusCode).toBe(404)
    })
  })
})
