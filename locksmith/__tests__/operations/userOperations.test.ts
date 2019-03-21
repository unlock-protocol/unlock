import UserOperations from '../../src/operations/userOperations'

const models = require('../../src/models')
let User: any = models.User
let UserReference: any = models.UserReference

describe('User creation', () => {
  let userCreationDetails = {
    emailAddress: 'USER@EXAMPLE.COM',
    publicKey: '0x21cc9c438d9751a3225496f6fd1f1215c7bd5d83',
    passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
    recoveryPhrase: 'recoveryPhrase',
  }

  describe("when a user for the public key doesn't exist", () => {
    it('should create a user and associated data', async () => {
      UserReference.create = jest.fn(() => {})

      expect.assertions(1)
      await UserOperations.createUser(userCreationDetails)
      expect(UserReference.create).toHaveBeenCalledWith(
        {
          User: {
            passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
            publicKey: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
            recoveryPhrase: 'recoveryPhrase',
          },
          emailAddress: 'user@example.com',
        },
        { include: User }
      )
    })

    it('should normalize the public key/address & email address', async () => {
      UserReference.create = jest.fn(() => {})
      expect.assertions(1)
      await UserOperations.createUser(userCreationDetails)
      expect(UserReference.create).toHaveBeenCalledWith(
        {
          User: {
            passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
            publicKey: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
            recoveryPhrase: 'recoveryPhrase',
          },
          emailAddress: 'user@example.com',
        },
        { include: User }
      )
    })
  })
})

describe('Private Key Lookup', () => {
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
