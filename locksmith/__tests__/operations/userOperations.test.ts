import { Op } from 'sequelize'
import UserOperations from '../../src/operations/userOperations'
import RecoveryPhrase from '../../src/utils/recoveryPhrase'
import * as models from '../../src/models'
import { vi } from 'vitest'

// TODO: remove this hack with proper mocking
const { User, UserReference } = models as any

const sampleCards = [
  {
    address_city: null,
    address_country: null,
    address_line1: null,
    address_line1_check: null,
    address_line2: null,
    address_state: null,
    address_zip: null,
    address_zip_check: null,
    brand: 'Visa',
    country: 'US',
    customer: 'cus_AsampleID',
    cvc_check: null,
    dynamic_last4: null,
    exp_month: 4,
    exp_year: 2020,
    fingerprint: 'AFKXiqgyjbiUvf93',
    funding: 'credit',
    id: 'card_1ES3nrIsiZS2oQBMVuCvrDJo',
    last4: '4242',
    metadata: {},
    name: null,
    object: 'card',
    tokenization_method: null,
  },
]

const mockStripeCards = {
  customers: {
    listSources: vi.fn().mockImplementation(() => {
      return {
        data: sampleCards,
      }
    }),
  },
}

const mockStripeWithoutCards = {
  customers: {
    listSources: vi.fn().mockImplementation(() => {
      return {
        data: [],
      }
    }),
  },
}

vi.mock('../../src/utils/recoveryPhrase', () => {
  return { default: {} }
})

vi.mock('stripe', () => {
  return {
    default: vi
      .fn()
      .mockImplementationOnce(() => mockStripeCards)
      .mockImplementationOnce(() => mockStripeWithoutCards),
  }
})

describe('User creation', () => {
  /* details are crafted to ensure normalization downstream */
  const userCreationDetails = {
    emailAddress: 'USER@EXAMPLE.COM',
    publicKey: '0x21cc9c438d9751a3225496f6fd1f1215c7bd5d83',
    passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
    recoveryPhrase: 'recoveryPhrase',
  }

  describe('data normalization', () => {
    it('should normalize the public key/address & email address', async () => {
      expect.assertions(1)
      UserReference.create = vi.fn(() => {})
      RecoveryPhrase.generate = vi.fn(() => 'generated phrase')

      await UserOperations.createUser(userCreationDetails)
      expect(UserReference.create).toHaveBeenCalledWith(
        expect.objectContaining({
          User: {
            passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
            publicKey: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
            recoveryPhrase: 'generated phrase',
          },
          emailAddress: 'user@example.com',
        }),
        { include: User }
      )
    })
  })

  describe('when able to create the user and associated data', () => {
    it('returns true', async () => {
      expect.assertions(1)
      UserReference.create = vi.fn(() => {
        return {}
      })

      const result = await UserOperations.createUser(userCreationDetails)
      expect(result).toBe(RecoveryPhrase.generate())
    })
  })

  describe('when unable to create the user and associated data', () => {
    it('returns false', async () => {
      expect.assertions(1)
      UserReference.create = vi.fn(() => {
        return null
      })

      const result = await UserOperations.createUser(userCreationDetails)
      expect(result).toBe(undefined)
    })
  })
})

describe('Private Key Lookup', () => {
  beforeAll(() => {
    UserReference.findOne = vi
      .fn()
      .mockImplementationOnce(() => {
        return {
          User: {
            passwordEncryptedPrivateKey: 'the value',
          },
        }
      })
      .mockImplementationOnce(() => {
        null
      })
  })

  describe('when the email address exists in persistence', () => {
    it('returns the appropriate encrypted private key', async () => {
      expect.assertions(1)
      const result = await UserOperations.getUserPrivateKeyByEmailAddress(
        'existing@example.com'
      )
      expect(result).toEqual('the value')
    })
  })

  describe('when the email address does not exist in persistence', () => {
    it('returns null', async () => {
      expect.assertions(1)
      const result = await UserOperations.getUserPrivateKeyByEmailAddress(
        'non-existant@example.com'
      )
      expect(result).toEqual(null)
    })
  })
})

describe('Recovery Phrase Lookup', () => {
  beforeAll(() => {
    UserReference.findOne = vi
      .fn()
      .mockImplementationOnce(() => {
        return {
          User: {
            recoveryPhrase: 'a recovery phrase',
          },
        }
      })
      .mockImplementationOnce(() => {
        null
      })
  })

  describe('when the email address exists in persistence', () => {
    it('returns the appropriate encrypted private key', async () => {
      expect.assertions(1)
      const result = await UserOperations.getUserRecoveryPhraseByEmailAddress(
        'existing@example.com'
      )
      expect(result).toEqual('a recovery phrase')
    })
  })

  describe('when the email does not exist in persistence', () => {
    it('returns null', async () => {
      expect.assertions(1)
      const result = await UserOperations.getUserRecoveryPhraseByEmailAddress(
        'non-existant@example.com'
      )
      expect(result).toEqual(null)
    })
  })
})

describe('Updating encrypted private key', () => {
  it('attemtps to update the relevant records', async () => {
    expect.assertions(1)
    User.update = vi.fn(() => {})

    await UserOperations.updatePasswordEncryptedPrivateKey(
      '0x21cc9c438d9751a3225496f6fd1f1215c7bd5d83',
      '{"data" : "encryptedPassword"}'
    )
    expect(User.update).toHaveBeenCalledWith(
      {
        passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      },
      {
        where: {
          publicKey: {
            [Op.eq]: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
          },
        },
      }
    )
  })
})

describe("Retrieving a user's cards", () => {
  describe('when the user has credit cards', () => {
    beforeAll(() => {
      UserReference.findOne = vi.fn().mockImplementation(() => {
        return {
          stripe_customer_id: 'cus_AsampleID',
          publicKey: '0xpublicKey',
        }
      })
    })

    it.skip('returns an array of card endings', async () => {
      expect.assertions(1)
      const cards = await UserOperations.getCards(
        'user_with_credit_cards@example.com'
      )
      expect(cards.length).toEqual(1)
    })
  })
  describe('when the user does not have credit cards', () => {
    it('returns an empty array', async () => {
      expect.assertions(1)
      const cards = await UserOperations.getCards(
        'user_without_credit_cards@example.com'
      )
      expect(cards).toEqual([])
    })
  })
  describe('when the user does not have a stripe customer id', () => {
    beforeAll(() => {
      UserReference.findOne = vi.fn().mockImplementationOnce(() => {
        return {
          stripe_customer_id: null,
        }
      })
    })
    it('returns an empty array', async () => {
      expect.assertions(1)

      const cards = await UserOperations.getCards(
        'user_without_stripe_customer_id@example.com'
      )
      expect(cards).toEqual([])
    })
  })
})
