import PaymentProcessor from '../../src/payment/paymentProcessor'
import * as Normalizer from '../../src/utils/normalizer'
import { UserReference } from '../../src/models/userReference'

const models = require('../../src/models')

const { User } = models

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      customers: {
        create: jest
          .fn()
          .mockResolvedValueOnce({ id: 'a valid customer id' })
          .mockRejectedValueOnce(new Error('unknown token')),
      },
      charges: {
        create: jest
          .fn()
          .mockResolvedValueOnce({
            status: 'succeeded',
          })
          .mockRejectedValueOnce('An error in purchase'),
      },
    }
  })
})

describe('PaymentProcessor', () => {
  let paymentProcessor: PaymentProcessor
  beforeAll(async () => {
    paymentProcessor = new PaymentProcessor('sk_test_token')

    await User.truncate({ cascade: true })

    await UserReference.create(
      {
        emailAddress: Normalizer.emailAddress('foo2@example.com'),
        User: {
          publicKey: Normalizer.ethereumAddress(
            '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8'
          ),
          recoveryPhrase: 'a recovery phrase',
          passwordEncryptedPrivateKey: "{ a: 'blob' }",
        },
      },
      {
        include: User,
      }
    )

    await UserReference.create(
      {
        emailAddress: Normalizer.emailAddress(
          'user_without_payment_details@example.com'
        ),
        User: {
          publicKey: Normalizer.ethereumAddress(
            '0xef49773e0d59f607cea8c8be4ce87bd26fd8e208'
          ),
          recoveryPhrase: 'a recovery phrase',
          passwordEncryptedPrivateKey: "{ a: 'blob' }",
        },
      },
      {
        include: User,
      }
    )
  })

  describe('updateUserPaymentDetails', () => {
    describe('when the user can be created', () => {
      it('returns the customer id', async () => {
        expect.assertions(1)
        let user = await paymentProcessor.updateUserPaymentDetails(
          'tok_visa',
          'foo2@example.com'
        )

        expect(user).toBe(true)
      })
    })

    describe('when the user can not be created', () => {
      it('returns false', async () => {
        expect.assertions(1)
        let user = await paymentProcessor.updateUserPaymentDetails(
          'tok_unknown',
          'foo2@example.com'
        )

        expect(user).toBe(false)
      })
    })
  })

  describe('chargeUser', () => {
    describe("when the user lack's payment details", () => {
      it('raises an error', async () => {
        expect.assertions(1)
        await expect(
          paymentProcessor.chargeUser(
            '0xef49773e0d59f607cea8c8be4ce87bd26fd8e208',
            {
              price: 3000,
            }
          )
        ).rejects.toEqual(new Error('Customer lacks purchasing details'))
      })

      describe('when the user has payment details', () => {
        describe('when the user can be charged', () => {
          it('returns a charge', async () => {
            expect.assertions(1)
            let charge = await paymentProcessor.chargeUser(
              '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8',
              {
                price: 2000,
              }
            )
            expect(charge).not.toBeNull()
          })
        })

        describe('when the user cant be charged', () => {
          it('returns an error', async () => {
            expect.assertions(1)
            await expect(
              paymentProcessor.chargeUser(
                '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8',
                {
                  price: 2000,
                }
              )
            ).rejects.toEqual('An error in purchase')
          })
        })
      })
    })
  })
})
