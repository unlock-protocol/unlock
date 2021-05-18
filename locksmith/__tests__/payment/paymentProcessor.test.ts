import path from 'path'
import PaymentProcessor from '../../src/payment/paymentProcessor'
import * as Normalizer from '../../src/utils/normalizer'
import { UserReference } from '../../src/models/userReference'

const nock = require('nock')
const nockBack = require('nock').back
const models = require('../../src/models')

const lockAddress = '0xf5d0c1cfe659902f9abae67a70d5923ef8dbc1dc'
const stripeToken = 'sk_test_token'
const mockVisaToken = 'tok_visa'

const { User } = models

const mockCreateSource = jest.fn()

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

const mockDispatcher = { purchase: jest.fn() }

jest.mock('../../src/fulfillment/dispatcher', () => {
  return jest.fn().mockImplementation(() => {
    return mockDispatcher
  })
})

jest.mock('../../src/utils/keyPricer', () => {
  return jest.fn().mockImplementation(() => {
    return {
      generate: jest.fn().mockReturnValue({
        keyPrice: 10,
        gasFee: 5,
        creditCardProcessing: 100,
        unlockServiceFee: 70,
      }),
      keyPriceUSD: jest.fn().mockResolvedValue(42),
    }
  })
})

describe('PaymentProcessor', () => {
  let paymentProcessor: PaymentProcessor

  beforeAll(async () => {
    nockBack.fixtures = path.join(__dirname, 'fixtures', 'paymentProcessor')
    nockBack.setMode('lockdown')

    const { nockDone } = await nockBack('setup.json')
    paymentProcessor = new PaymentProcessor(stripeToken)

    await User.truncate({ cascade: true })
    await UserReference.create(
      {
        emailAddress: Normalizer.emailAddress('foo2@example.com'),
        stripe_customer_id: 'a valid customer id',
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
          'connected_account_user@example.com'
        ),
        stripe_customer_id: 'cus_H669IyGrYp85kA',
        User: {
          publicKey: Normalizer.ethereumAddress(
            '0x9409bd2f87f0698f89c04caee8ddb2fd9e44bcc3'
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

    nockDone()
  })

  afterAll(() => {
    nock.restore()
  })

  describe('updateUserPaymentDetails', () => {
    describe('when the user can be created', () => {
      it('returns the customer id', async () => {
        expect.assertions(1)
        const user = await paymentProcessor.updateUserPaymentDetails(
          mockVisaToken,
          '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8'
        )

        expect(user).toBe(true)
      })
    })

    describe('when the user already has an existing stripe customer id', () => {
      it("adds the card to the user's acceptable card", async () => {
        expect.assertions(2)
        const user = await paymentProcessor.updateUserPaymentDetails(
          mockVisaToken,
          '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8'
        )

        expect(mockCreateSource).toHaveBeenCalledWith('a valid customer id', {
          source: mockVisaToken,
        })
        expect(user).toBe(true)
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
            lockAddress,
            1984
          )
        ).rejects.toEqual(new Error('Customer lacks purchasing details'))
      })

      describe('when the user has payment details', () => {
        describe('when the user can be charged', () => {
          it('returns a charge', async () => {
            expect.assertions(1)
            const { nockDone } = await nockBack('charged_user.json')
            const charge = await paymentProcessor.chargeUser(
              '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8',
              lockAddress,
              1984
            )
            expect(charge).not.toBeNull()
            nockDone()
          })
        })

        describe('when the user cant be charged', () => {
          it('returns an error', async () => {
            expect.assertions(1)
            const { nockDone } = await nockBack('non_charged_user.json')
            await expect(
              paymentProcessor.chargeUser(
                '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8',
                lockAddress,
                1984
              )
            ).rejects.toEqual('An error in purchase')
            nockDone()
          })
        })
      })
    })
  })

  describe('price', () => {
    it('returns the total price of the key purchase for the provided lock', async () => {
      expect.assertions(1)
      const { nockDone } = await nockBack('price.json')

      /**
       * key price:        100
       * gas fee:            0
       * unlockServiceFee:  50
       * stripe percentage:  5 (150 * 0.029, rounded up)
       * stripe flat fee:    30
       *                   ---
       * total:            185
       */
      const expectedKeyPrice = 185
      expect(await paymentProcessor.price(lockAddress, 1984)).toEqual(
        expectedKeyPrice
      )
      nockDone()
    })
  })

  // // https://dashboard.stripe.com/test/connect/accounts/overview

  describe('chargeUserForConnectedAccount', () => {
    const accountId = 'acct_1GXsNrL9eCzn3mEi'
    describe("when the user lack's payment details", () => {
      it('raises an error', async () => {
        expect.assertions(1)
        await expect(
          paymentProcessor.chargeUserForConnectedAccount(
            '0xef49773e0d59f607cea8c8be4ce87bd26fd8e208',
            lockAddress,
            accountId,
            1984
          )
        ).rejects.toEqual(new Error('Customer lacks purchasing details'))
      })

      describe('when the user has payment details', () => {
        describe('when the user can be charged', () => {
          it('returns a charge', async () => {
            expect.assertions(1)
            const { nockDone } = await nockBack(
              'connected_account_charged_user.json'
            )
            const charge = await paymentProcessor.chargeUserForConnectedAccount(
              '0x9409bd2f87f0698f89c04caee8ddb2fd9e44bcc3',
              lockAddress,
              accountId,
              1984
            )

            expect(charge).not.toBeNull()
            nockDone()
          })
        })

        describe('when the user cant be charged', () => {
          it('returns an error', async () => {
            expect.assertions(1)
            const { nockDone } = await nockBack(
              'connected_account_non_charged_user.json'
            )
            await expect(
              paymentProcessor.chargeUserForConnectedAccount(
                '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b9',
                lockAddress,
                accountId,
                1984
              )
            ).rejects.toMatchObject(
              new Error('Customer lacks purchasing details')
            )
            nockDone()
          })
        })
      })
    })
  })

  describe('isKeyFree', () => {
    beforeAll(() => {
      paymentProcessor.keyPricer.keyPrice = jest
        .fn()
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(2)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('when a key is free', () => {
      it('returns true', async () => {
        expect.assertions(1)
        expect(await paymentProcessor.isKeyFree('freeLockAddress', 1984)).toBe(
          true
        )
      })
    })

    describe('when a key is not free', () => {
      it('returns false', async () => {
        expect.assertions(1)
        expect(
          await paymentProcessor.isKeyFree('nonFreeLockAddress', 1984)
        ).toBe(false)
      })
    })
  })

  describe('initiatePurchase', () => {
    beforeAll(() => {
      paymentProcessor.chargeUser = jest
        .fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(null)

      paymentProcessor.isKeyFree = jest
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('when the keys of the lock are free', () => {
      it('does not charge the user', async () => {
        expect.assertions(1)
        await paymentProcessor.initiatePurchase(
          'recipient',
          'lock',
          'credentials',
          'providerHost',
          'buyer',
          1984
        )

        expect(paymentProcessor.chargeUser).not.toBeCalled()
      })
    })

    describe("when the keys of the lock aren't free", () => {
      describe('when the user was successfully charged', () => {
        it('dispatches the purchase', async () => {
          expect.assertions(1)
          await paymentProcessor.initiatePurchase(
            'recipient',
            'lock',
            'credentials',
            'providerHost',
            'buyer',
            1984
          )

          expect(mockDispatcher.purchase).toHaveBeenCalledWith(
            'lock',
            'recipient',
            1984
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
            'buyer',
            1984
          )

          expect(mockDispatcher.purchase).not.toHaveBeenCalled()
        })
      })
    })
  })
})
