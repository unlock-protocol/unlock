import UserOperations from '../../src/operations/userOperations'
import RecoveryPhrase from '../../src/utils/recoveryPhrase'

import Sequelize = require('sequelize')

const Op = Sequelize.Op
const models = require('../../src/models')

let User: any = models.User
let UserReference: any = models.UserReference
let sampleCards = [
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

let mockStripeCards = {
  customers: {
    listSources: jest.fn().mockImplementation(() => {
      return {
        data: sampleCards,
      }
    }),
  },
}

let mockStripeWithoutCards = {
  customers: {
    listSources: jest.fn().mockImplementation(() => {
      return {
        data: [],
      }
    }),
  },
}

jest.mock('../../src/utils/recoveryPhrase', () => ({}))
jest.mock('stripe', () => {
  return jest
    .fn()
    .mockImplementationOnce(() => mockStripeCards)
    .mockImplementationOnce(() => mockStripeWithoutCards)
})

describe('User creation', () => {
  /* details are crafted to ensure normalization downstream*/
  let userCreationDetails = {
    emailAddress: 'USER@EXAMPLE.COM',
    publicKey: '0x21cc9c438d9751a3225496f6fd1f1215c7bd5d83',
    passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
    recoveryPhrase: 'recoveryPhrase',
  }

  describe('data normalization', () => {
    it('should normalize the public key/address & email address', async () => {
      expect.assertions(1)
      UserReference.create = jest.fn(() => {})
      RecoveryPhrase.generate = jest.fn(() => 'generated phrase')

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
      UserReference.create = jest.fn(() => {
        return {}
      })

      let result = await UserOperations.createUser(userCreationDetails)
      expect(result).toBe(RecoveryPhrase.generate())
    })
  })

  describe('when unable to create the user and associated data', () => {
    it('returns false', async () => {
      expect.assertions(1)
      UserReference.create = jest.fn(() => {
        return null
      })

      let result = await UserOperations.createUser(userCreationDetails)
      expect(result).toBe(undefined)
    })
  })
})

describe('Private Key Lookup', () => {
  beforeAll(() => {
    UserReference.findOne = jest
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
      let result = await UserOperations.getUserPrivateKeyByEmailAddress(
        'existing@example.com'
      )
      expect(result).toEqual('the value')
    })
  })

  describe('when the email address does not exist in persistence', () => {
    it('returns null', async () => {
      expect.assertions(1)
      let result = await UserOperations.getUserPrivateKeyByEmailAddress(
        'non-existant@example.com'
      )
      expect(result).toEqual(null)
    })
  })
})

describe('Recovery Phrase Lookup', () => {
  beforeAll(() => {
    UserReference.findOne = jest
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
      let result = await UserOperations.getUserRecoveryPhraseByEmailAddress(
        'existing@example.com'
      )
      expect(result).toEqual('a recovery phrase')
    })
  })

  describe('when the email does not exist in persistence', () => {
    it('returns null', async () => {
      expect.assertions(1)
      let result = await UserOperations.getUserRecoveryPhraseByEmailAddress(
        'non-existant@example.com'
      )
      expect(result).toEqual(null)
    })
  })
})

describe('Updating encrypted private key', () => {
  it('attemtps to update the relevant records', async () => {
    expect.assertions(1)
    User.update = jest.fn(() => {})

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
      UserReference.findOne = jest.fn().mockImplementationOnce(() => {
        return {
          stripe_customer_id: 'cus_AsampleID',
        }
      })
    })

    it('returns an array of card endings', async () => {
      expect.assertions(1)
      let cards = await UserOperations.getCards(
        'user_with_credit_cards@example.com'
      )
      expect(cards.length).toEqual(1)
    })
  })
  describe('when the user does not have credit cards', () => {
    it('returns an empty array', async () => {
      expect.assertions(1)
      let cards = await UserOperations.getCards(
        'user_without_credit_cards@example.com'
      )
      expect(cards).toEqual([])
    })
  })
  describe('when the user does not have a stripe customer id', () => {
    beforeAll(() => {
      UserReference.findOne = jest.fn().mockImplementationOnce(() => {
        return {
          stripe_customer_id: null,
        }
      })
    })
    it('returns an empty array', async () => {
      expect.assertions(1)

      let cards = await UserOperations.getCards(
        'user_without_stripe_customer_id@example.com'
      )
      expect(cards).toEqual([])
    })
  })
})

describe('When marking a user as ejected', () => {
  it.skip("applies the ejection date to the user's record", async () => {
    expect.assertions(1)

    RecoveryPhrase.generate = jest.fn(() => 'generated phrase')

    let userCreationDetails = {
      emailAddress: 'USER@EXAMPLE.COM',
      publicKey: '0x21cc9c438d9751a3225496f6fd1f1215c7bd5d83',
      passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
      recoveryPhrase: 'recoveryPhrase',
    }

    // try{
    // await UserOperations.createUser(userCreationDetails)
    // }catch(e){
    //   console.log('this happened ', e)
    // }
    await UserOperations.eject(userCreationDetails.publicKey)

    let record = await User.findOne({
      where: {
        publicKey: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
      },
    })
    expect(record.ejection).not.toBe(null)
  })
})
