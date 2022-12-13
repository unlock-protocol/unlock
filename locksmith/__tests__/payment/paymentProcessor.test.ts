import path from 'path'
import PaymentProcessor from '../../src/payment/paymentProcessor'
import * as Normalizer from '../../src/utils/normalizer'
import { UserReference } from '../../src/models/userReference'
import nock from 'nock'
import { User } from '../../src/models/user'
const lockAddress = '0xf5d0c1cfe659902f9abae67a70d5923ef8dbc1dc'
const stripeToken = 'sk_test_token'
const mockVisaToken = 'tok_visa'
const nockBack = nock.back
import { vi } from 'vitest'
const mockCreateSource = vi.fn()

vi.mock('stripe', () => {
  return vi.fn().mockImplementation(() => {
    return {
      customers: {
        create: vi
          .fn()
          .mockResolvedValueOnce({ id: 'a valid customer id' })
          .mockRejectedValueOnce(new Error('unknown token')),
        createSource: mockCreateSource,
      },
      charges: {
        create: vi
          .fn()
          .mockResolvedValueOnce({
            status: 'succeeded',
          })
          .mockRejectedValueOnce('An error in purchase'),
      },
    }
  })
})

// eslint-disable-next-line
var mockDispatcher = { purchase: vi.fn() }

vi.mock('../../src/fulfillment/dispatcher', () => {
  return vi.fn().mockImplementation(() => {
    return mockDispatcher
  })
})

vi.mock('../../src/utils/keyPricer', () => {
  return vi.fn().mockImplementation(() => {
    return {
      generate: vi.fn().mockReturnValue({
        keyPrice: 10,
        gasFee: 5,
        creditCardProcessing: 100,
        unlockServiceFee: 70,
      }),
      keyPriceUSD: vi.fn().mockResolvedValue(42),
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
        // @ts-expect-error - Sequelize type does not support creating a relationship item in the create yet. This is a bug in Sequelize types.
        User: {
          publicKey: Normalizer.ethereumAddress(
            '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8'
          ),
          recoveryPhrase: 'a recovery phrase',
          passwordEncryptedPrivateKey: { a: 'blob' },
        },
      },
      {
        include: [User],
      }
    )

    await UserReference.create(
      {
        emailAddress: Normalizer.emailAddress(
          'connected_account_user@example.com'
        ),
        stripe_customer_id: 'cus_H669IyGrYp85kA',
        // @ts-expect-error - Sequelize type does not support creating a relationship item in the create yet. This is a bug in Sequelize types.
        User: {
          publicKey: Normalizer.ethereumAddress(
            '0x9409bd2f87f0698f89c04caee8ddb2fd9e44bcc3'
          ),
          recoveryPhrase: 'a recovery phrase',
          passwordEncryptedPrivateKey: "{ a: 'blob' }",
        },
      },
      {
        include: [User],
      }
    )

    await UserReference.create(
      {
        emailAddress: Normalizer.emailAddress(
          'user_without_payment_details@example.com'
        ),
        // @ts-expect-error - Sequelize type does not support creating a relationship item in the create yet. This is a bug in Sequelize types.
        User: {
          publicKey: Normalizer.ethereumAddress(
            '0xef49773e0d59f607cea8c8be4ce87bd26fd8e208'
          ),
          recoveryPhrase: 'a recovery phrase',
          passwordEncryptedPrivateKey: "{ a: 'blob' }",
        },
      },
      {
        include: [User],
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
  describe('chargeUserForConnectedAccount', () => {
    const accountId = 'acct_1GXsNrL9eCzn3mEi'
    describe('when the user can be charged', () => {
      it.skip('returns a charge', async () => {
        expect.assertions(1)
        const { nockDone } = await nockBack(
          'connected_account_charged_user.json'
        )
        const charge = await paymentProcessor.chargeUserForConnectedAccount(
          '0x9409bd2f87f0698f89c04caee8ddb2fd9e44bcc3',
          accountId,
          lockAddress,
          accountId,
          31337,
          1.85
        )

        expect(charge).not.toBeNull()
        nockDone()
      })
    })
  })
})
