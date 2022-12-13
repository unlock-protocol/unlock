import { ethers } from 'ethers'
import request from 'supertest'

import app from '../../../src/server'
import * as Base64 from '../../../src/utils/base64'
import { User, UserReference, StripeCustomer } from '../../../src/models'
import UserOperations from '../../../src/operations/userOperations'
import StripeOperations from '../../../src/operations/stripeOperations'
import { vi } from 'vitest'
const publicKey = '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'

function generateTypedData(message: any, messageKey: string) {
  return {
    types: {
      User: [{ name: 'publicKey', type: 'address' }],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'User',
    message,
    messageKey,
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
        'Get Card': {
          publicKey: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        },
      }

      const wallet = new ethers.Wallet(
        '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
      )

      const typedData = generateTypedData(message, 'Get Card')

      const { domain, types } = typedData
      const sig = await wallet._signTypedData(
        domain,
        types,
        message['Get Card']
      )

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
        'Get Card': {
          publicKey: '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a',
        },
      }

      const wallet = new ethers.Wallet(
        '0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61'
      )

      const typedData = generateTypedData(message, 'Get Card')

      const sig = await wallet.signMessage(
        `I want to retrieve the card token for ${message['Get Card'].publicKey}`
      )

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
        'Save Card': {
          publicKey,
          stripeTokenId: 'tok_visa',
        },
      }

      const typedData = generateTypedData(message, 'Save Card')

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
        'Save Card': {
          publicKey: '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a',
          stripeTokenId: 'tok_visa',
        },
      }

      const wallet = new ethers.Wallet(
        '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
      )

      const typedData = generateTypedData(message, 'Save Card')
      const sig = await wallet.signMessage(JSON.stringify(typedData))

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
        'Save Card': {
          publicKey,
          stripeTokenId: 'tok_visa',
        },
      }

      const wallet = new ethers.Wallet(
        '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
      )

      vi.spyOn(UserOperations, 'updatePaymentDetails').mockReturnValueOnce(
        Promise.resolve(true)
      )

      const typedData = generateTypedData(message, 'Save Card')
      const sig = await wallet.signMessage(
        `I save my payment card for my account ${message['Save Card'].publicKey}`
      )

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
        'Save Card': {
          publicKey,
          stripeTokenId: 'tok_visa',
        },
      }

      const wallet = new ethers.Wallet(
        '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
      )

      const typedData = generateTypedData(message, 'Save Card')
      const sig = await wallet.signMessage(
        `I save my payment card for my account ${message['Save Card'].publicKey}`
      )

      vi.spyOn(UserOperations, 'updatePaymentDetails').mockReturnValueOnce(
        Promise.resolve(false)
      )

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
        'Delete Card': {
          publicKey,
        },
      }

      const typedData = generateTypedData(message, 'Delete Card')

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
        'Delete Card': {
          publicKey: '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a',
        },
      }

      const wallet = new ethers.Wallet(
        '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
      )

      const typedData = generateTypedData(message, 'Delete Card')
      const sig = await wallet.signMessage(JSON.stringify(typedData))

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
        'Delete Card': {
          publicKey: '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a',
        },
      }

      const wallet = new ethers.Wallet(
        '0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61'
      )

      vi.spyOn(
        StripeOperations,
        'deletePaymentDetailsForAddress'
      ).mockReturnValueOnce(Promise.resolve(true))

      const typedData = generateTypedData(message, 'Delete Card')
      const sig = await wallet.signMessage(
        `I am deleting the card linked to my account ${message['Delete Card'].publicKey}`
      )

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
        'Delete Card': {
          publicKey: '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a',
        },
      }

      const wallet = new ethers.Wallet(
        '0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61'
      )

      vi.spyOn(
        StripeOperations,
        'deletePaymentDetailsForAddress'
      ).mockReturnValueOnce(Promise.resolve(false))

      const typedData = generateTypedData(message, 'Delete Card')
      const sig = await wallet.signMessage(
        `I am deleting the card linked to my account ${message['Delete Card'].publicKey}`
      )

      const response = await request(app)
        .delete(`/users/${publicKey}/credit-cards`)
        .set('Authorization', `Bearer-Simple ${Base64.encode(sig)}`)
        .query({ data: JSON.stringify(typedData) })

      expect(response.status).toBe(400)
    })
  })
})
