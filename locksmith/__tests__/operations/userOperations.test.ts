import UserOperations from '../../src/operations/userOperations'

const models = require('../../src/models')

let User: any = models.User
let UserReference: any = models.UserReference

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

      await UserOperations.createUser(userCreationDetails)
      expect(UserReference.create).toHaveBeenCalledWith(
        expect.objectContaining({
          User: {
            passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
            publicKey: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
            recoveryPhrase: expect.any(String),
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
      expect(result).toBe(true)
    })
  })

  describe('when unable to create the user and associated data', () => {
    it('returns false', async () => {
      expect.assertions(1)
      UserReference.create = jest.fn(() => {
        return null
      })

      let result = await UserOperations.createUser(userCreationDetails)
      expect(result).toBe(false)
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
