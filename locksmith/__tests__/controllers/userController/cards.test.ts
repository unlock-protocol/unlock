import request from 'supertest'

import ethJsUtil = require('ethereumjs-util')
import sigUtil = require('eth-sig-util')
import app = require('../../../src/app')
import Base64 = require('../../../src/utils/base64')
import models = require('../../../src/models')
import UserOperations = require('../../../src/operations/userOperations')
import StripeOperations = require('../../../src/operations/stripeOperations')

const { UserReference } = models
const { User } = models
const { StripeCustomer } = models

const publicKey = '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'

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
      User: [{ name: 'publicKey', type: 'address' }],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'User',
    message,
  }
}

beforeAll(async () => {
  await Promise.all([
    StripeCustomer.truncate({ cascade: true }),
    UserReference.truncate({ cascade: true }),
    User.truncate({ cascade: true }),
  ])

  const userCreationDetails = {
    emailAddress: 'existing@example.com',
    publicKey,
    passwordEncryptedPrivateKey: '{"data" : "encryptedPassword"}',
    recoveryPhrase: 'a recovery phrase',
  }

  await UserOperations.createUser(userCreationDetails)
})

afterAll(async () => {
  const { User } = models
  const { UserReference } = models

  return Promise.all([
    User.truncate({ cascade: true }),
    UserReference.truncate({ cascade: true }),
  ])
})

describe('when requesting cards', () => {
  describe('when the request does not include a signature', () => {
    it('returns a 401', async () => {
      expect.assertions(1)

      const response = await request(app).get(
        `/users/${publicKey}/credit-cards`
      )
      expect(response.status).toBe(401)
    })
  })

  describe('when the request includes a signature that does not match the public address', () => {
    it('returns a 401', async () => {
      expect.assertions(1)

      const message = {
        user: {
          publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        },
      }

      const privateKey = ethJsUtil.toBuffer(
        '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
      )

      const typedData = generateTypedData(message)
      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
      })

      const response = await request(app)
        .get(`/users/${publicKey}/credit-cards`)
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)

      expect(response.status).toBe(401)
    })
  })

  describe('when a valid signature is provided', () => {
    it('returns the request cards', async () => {
      expect.assertions(1)

      const message = {
        user: {
          publicKey: '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a',
        },
      }

      const privateKey = ethJsUtil.toBuffer(
        '0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61'
      )

      const typedData = generateTypedData(message)
      const sig = sigUtil.personalSign(privateKey, {
        data: JSON.stringify(typedData),
      })

      const response = await request(app)
        .get(`/users/${publicKey}/credit-cards`)
        .set('Authorization', `Bearer-Simple ${Base64.encode(sig)}`)
        .query({ data: JSON.stringify(typedData) })

      expect(response.status).toBe(200)
    })
  })
})

describe('when updating cards', () => {
  describe('when there is no signature', () => {
    it('returns 401', async () => {
      expect.assertions(1)

      const publicKey = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

      const message = {
        user: {
          publicKey,
          stripeTokenId: 'tok_visa',
        },
      }

      const typedData = generateTypedData(message)

      const response = await request(app)
        .put(`/users/${publicKey}/credit-cards`)
        .send(typedData)

      expect(response.status).toBe(401)
    })
  })

  describe('when the signature does not match the user', () => {
    it('returns 401', async () => {
      expect.assertions(1)

      expect.assertions(1)

      const publicKey = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

      const message = {
        user: {
          publicKey: '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a',
          stripeTokenId: 'tok_visa',
        },
      }

      const privateKey = ethJsUtil.toBuffer(
        '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
      )

      const typedData = generateTypedData(message)
      const sig = sigUtil.personalSign(privateKey, {
        data: JSON.stringify(typedData),
      })

      const response = await request(app)
        .put(`/users/${publicKey}/credit-cards`)
        .set('Authorization', `Bearer-Simple ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toBe(401)
    })
  })

  describe("when able to update the user's payment details with an address", () => {
    it('returns 202', async () => {
      expect.assertions(1)

      const publicKey = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

      const message = {
        user: {
          publicKey,
          stripeTokenId: 'tok_visa',
        },
      }

      const privateKey = ethJsUtil.toBuffer(
        '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
      )

      jest
        .spyOn(UserOperations, 'updatePaymentDetails')
        .mockReturnValueOnce(Promise.resolve(true))

      const typedData = generateTypedData(message)
      const sig = sigUtil.personalSign(privateKey, {
        data: JSON.stringify(typedData),
      })

      const response = await request(app)
        .put(`/users/${publicKey}/credit-cards`)
        .set('Authorization', `Bearer-Simple ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toBe(202)
    })
  })

  describe("when unable to update the user's payment details with the the public key", () => {
    it('returns 400', async () => {
      expect.assertions(1)
      const publicKey = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

      const message = {
        user: {
          publicKey,
          stripeTokenId: 'tok_visa',
        },
      }

      const privateKey = ethJsUtil.toBuffer(
        '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
      )

      const typedData = generateTypedData(message)
      const sig = sigUtil.personalSign(privateKey, {
        data: JSON.stringify(typedData),
      })

      jest
        .spyOn(UserOperations, 'updatePaymentDetails')
        .mockReturnValueOnce(Promise.resolve(false))

      const response = await request(app)
        .put(`/users/${publicKey}/credit-cards`)
        .set('Authorization', `Bearer-Simple ${Base64.encode(sig)}`)
        .send(typedData)
      expect(response.status).toBe(400)
    })
  })
})

describe('when deleting cards', () => {
  describe('when there is no signature', () => {
    it('returns 401', async () => {
      expect.assertions(1)

      const publicKey = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

      const message = {
        user: {
          publicKey,
        },
      }

      const typedData = generateTypedData(message)

      const response = await request(app)
        .delete(`/users/${publicKey}/credit-cards`)
        .send(typedData)

      expect(response.status).toBe(401)
    })
  })

  describe('when the signature does not match the user', () => {
    it('returns 401', async () => {
      expect.assertions(1)

      expect.assertions(1)

      const publicKey = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

      const message = {
        user: {
          publicKey: '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a',
        },
      }

      const privateKey = ethJsUtil.toBuffer(
        '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
      )

      const typedData = generateTypedData(message)
      const sig = sigUtil.personalSign(privateKey, {
        data: JSON.stringify(typedData),
      })

      const response = await request(app)
        .delete(`/users/${publicKey}/credit-cards`)
        .set('Authorization', `Bearer-Simple ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toBe(401)
    })
  })

  describe("when able to delete the user's payment details with an address", () => {
    it('returns 202', async () => {
      expect.assertions(1)

      const message = {
        user: {
          publicKey: '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a',
        },
      }

      const privateKey = ethJsUtil.toBuffer(
        '0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61'
      )

      jest
        .spyOn(StripeOperations, 'deletePaymentDetailsForAddress')
        .mockReturnValueOnce(Promise.resolve(true))

      const typedData = generateTypedData(message)
      const sig = sigUtil.personalSign(privateKey, {
        data: JSON.stringify(typedData),
      })

      const response = await request(app)
        .delete(`/users/${publicKey}/credit-cards`)
        .set('Authorization', `Bearer-Simple ${Base64.encode(sig)}`)
        .query({ data: JSON.stringify(typedData) })

      expect(response.status).toBe(202)
    })
  })

  describe("when unable to delete the user's payment details with the the public key", () => {
    it('returns 400', async () => {
      expect.assertions(1)

      const message = {
        user: {
          publicKey: '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a',
        },
      }

      const privateKey = ethJsUtil.toBuffer(
        '0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61'
      )

      jest
        .spyOn(StripeOperations, 'deletePaymentDetailsForAddress')
        .mockReturnValueOnce(Promise.resolve(false))

      const typedData = generateTypedData(message)
      const sig = sigUtil.personalSign(privateKey, {
        data: JSON.stringify(typedData),
      })

      const response = await request(app)
        .delete(`/users/${publicKey}/credit-cards`)
        .set('Authorization', `Bearer-Simple ${Base64.encode(sig)}`)
        .query({ data: JSON.stringify(typedData) })

      expect(response.status).toBe(400)
    })
  })
})
