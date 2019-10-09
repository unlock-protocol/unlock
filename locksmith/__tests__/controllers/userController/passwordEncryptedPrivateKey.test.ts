import models = require('../../../src/models')

jest.mock('../../../src/utils/ownedKeys', () => {
  return {
    keys: jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(['0x1234'])
      .mockResolvedValueOnce(['0x1234']),
  }
})

function generateTypedData(message: any) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
      User: [
        { name: 'emailAddress', type: 'string' },
        { name: 'publicKey', type: 'address' },
        { name: 'passwordEncryptedPrivateKey', type: 'string' },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'User',
    message: message,
  }
}

beforeAll(() => {
  let UserReference = models.UserReference
  let User = models.User

  return Promise.all([
    UserReference.truncate({ cascade: true }),
    User.truncate({ cascade: true }),
  ])
})

describe("updating a user's password encrypted private key", () => {
  let models = require('../../../src/models')
  let User = models.User
  const request = require('supertest')
  const sigUtil = require('eth-sig-util')
  const ethJsUtil = require('ethereumjs-util')
  const app = require('../../../src/app')

  const UserOperations = require('../../../src/operations/userOperations')
  const Base64 = require('../../../src/utils/base64')

  let privateKey = ethJsUtil.toBuffer(
    '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
  )

  let message = {
    user: {
      emailAddress: 'user@example.com',
      publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
      passwordEncryptedPrivateKey: '{"data" : "New Encrypted Password"}',
    },
  }

  let typedData = generateTypedData(message)
  const sig = sigUtil.signTypedData(privateKey, {
    data: typedData,
  })

  it('updates the password encrypted private key of the user', async () => {
    expect.assertions(2)

    let emailAddress = 'user@example.com'

    let userCreationDetails = {
      emailAddress: emailAddress,
      publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
      passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
    }

    await UserOperations.createUser(userCreationDetails)

    let response = await request(app)
      .put(
        '/users/0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2/passwordEncryptedPrivateKey'
      )
      .set('Accept', /json/)
      .set('Authorization', `Bearer ${Base64.encode(sig)}`)
      .send(typedData)

    let user = await User.findOne({
      where: { publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2' },
    })

    expect(user.passwordEncryptedPrivateKey).toEqual(
      '{"data" : "New Encrypted Password"}'
    )
    expect(response.status).toBe(202)
  })
})
