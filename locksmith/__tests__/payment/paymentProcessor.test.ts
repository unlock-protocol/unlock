import PaymentProcessor from '../../src/payment/paymentProcessor'
import * as Normalizer from '../../src/utils/normalizer'
import { UserReference } from '../../src/models/userReference'

const models = require('../../src/models')

const { User } = models

let mockCreateSource = jest.fn()

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      customers: {
        create: jest
          .fn()
          .mockResolvedValueOnce({ id: 'a valid customer id' })
          .mockRejectedValueOnce(new Error('unknown token')),
        createSource: mockCreateSource,
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

let mockDispatcher = { purchase: jest.fn() }

jest.mock('../../src/fulfillment/dispatcher', () => {
  return jest.fn().mockImplementation(() => {
    return mockDispatcher
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
          '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8'
        )

        expect(user).toBe(true)
      })
    })

    describe('when the user already has an existing stripe customer id', () => {
      it("adds the card to the user's acceptable card", async () => {
        expect.assertions(2)
        let user = await paymentProcessor.updateUserPaymentDetails(
          'tok_visa_2',
          '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8'
        )

        expect(mockCreateSource).toHaveBeenCalledWith('a valid customer id', {
          source: 'tok_visa_2',
        })
        expect(user).toBe(true)
      })
    })

    describe('when the user can not be created', () => {
      it('returns false', async () => {
        expect.assertions(1)
        let user = await paymentProcessor.updateUserPaymentDetails(
          'tok_unknown',
          '0xb76ef2e0d0edcce723b3fdd4307db6c5f0dda1b8'
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
            '0xe4906CE8a8E861339F75611c129b9679EDAe7bBD'
          )
        ).rejects.toEqual(new Error('Customer lacks purchasing details'))
      })

      describe('when the user has payment details', () => {
        describe('when the user can be charged', () => {
          it('returns a charge', async () => {
            expect.assertions(1)
            let charge = await paymentProcessor.chargeUser(
              '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8',
              '0xe4906CE8a8E861339F75611c129b9679EDAe7bBD'
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
                '0xe4906CE8a8E861339F75611c129b9679EDAe7bBD'
              )
            ).rejects.toEqual('An error in purchase')
          })
        })
      })
    })
  })

  describe('price', () => {
    it('returns the total price of the key purchase for the provided lock', () => {
      expect.assertions(1)
      expect(
        paymentProcessor.price('0xe4906CE8a8E861339F75611c129b9679EDAe7bBD')
      ).toEqual(720)
    })
  })

  describe('initiatePurchase', () => {
    beforeAll(() => {
      paymentProcessor.chargeUser = jest
        .fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(null)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('when the user was successfully charged', () => {
      it('dispatches the purchase', async () => {
        expect.assertions(1)
        await paymentProcessor.initiatePurchase(
          'recipient',
          'lock',
          'credentials',
          'providerHost',
          'buyer'
        )

        expect(mockDispatcher.purchase).toHaveBeenCalledWith(
          'lock',
          'recipient'
        )
      })
    })

    describe('when the user was unsuccessfully charged', () => {
      it('does not dispatch the purchase', async () => {
        expect.assertions(1)
        await paymentProcessor.initiatePurchase(
          'recipient',
          'lock',
          'credentials',
          'providerHost',
          'buyer'
        )

        expect(mockDispatcher.purchase).not.toHaveBeenCalled()
      })
    })
  })
})
