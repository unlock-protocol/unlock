import PaymentProcessor from '../../src/payment/paymentProcessor'
import * as Normalizer from '../../src/utils/normalizer'
import { UserReference } from '../../src/models/userReference'

const nock = require('nock')
const nockBack = require('nock').back
const models = require('../../src/models')

const lockAddress = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'
const unlockContractAddress = '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93'
const stripeToken = 'sk_test_token'
const web3HostURL = 'http://0.0.0.0:8545'
let mockVisaToken = 'tok_visa'

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
    nockBack.fixtures = `${__dirname}/fixtures/paymentProcessor`
    nockBack.setMode('lockdown')

    let { nockDone } = await nockBack('setup.json')
    paymentProcessor = new PaymentProcessor(
      stripeToken,
      web3HostURL,
      unlockContractAddress
    )

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
        let user = await paymentProcessor.updateUserPaymentDetails(
          mockVisaToken,
          '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8'
        )

        expect(user).toBe(true)
      })
    })

    describe('when the user already has an existing stripe customer id', () => {
      it("adds the card to the user's acceptable card", async () => {
        expect.assertions(2)
        let user = await paymentProcessor.updateUserPaymentDetails(
          mockVisaToken,
          '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8'
        )

        expect(mockCreateSource).toHaveBeenCalledWith('a valid customer id', {
          source: mockVisaToken,
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
            lockAddress
          )
        ).rejects.toEqual(new Error('Customer lacks purchasing details'))
      })

      describe('when the user has payment details', () => {
        describe('when the user can be charged', () => {
          it('returns a charge', async () => {
            expect.assertions(1)
            let { nockDone } = await nockBack('charged_user.json')
            let charge = await paymentProcessor.chargeUser(
              '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8',
              lockAddress
            )
            expect(charge).not.toBeNull()
            nockDone()
          })
        })

        describe('when the user cant be charged', () => {
          it('returns an error', async () => {
            expect.assertions(1)
            let { nockDone } = await nockBack('non_charged_user.json')
            await expect(
              paymentProcessor.chargeUser(
                '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8',
                lockAddress
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
      let { nockDone } = await nockBack('non_charged_user.json')
      expect(await paymentProcessor.price(lockAddress)).toEqual(501)
      nockDone()
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
