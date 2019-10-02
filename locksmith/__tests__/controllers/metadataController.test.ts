import request from 'supertest'
import * as sigUtil from 'eth-sig-util'
import * as ethJsUtil from 'ethereumjs-util'
import { LockMetadata } from '../../src/models/lockMetadata'
import { KeyMetadata } from '../../src/models/keyMetadata'

const app = require('../../src/app')
const Base64 = require('../../src/utils/base64')

let privateKey = ethJsUtil.toBuffer(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

let privateKey2 = ethJsUtil.toBuffer(
  '0xbbabdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

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
      LockMetadata: [
        { name: 'address', type: 'address' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'image', type: 'string' },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'LockMetadata',
    message: message,
  }
}

function generateKeyTypedData(message: any) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
      KeyMetadata: [],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'KeyMetadata',
    message: message,
  }
}

jest.mock('../../src/utils/keyData', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn().mockResolvedValue({
        owner: '0xabcd',
        expiration: 1567190711,
      }),
      openSeaPresentation: jest.fn().mockReturnValue({
        attributes: [
          {
            trait_type: 'expiration',
            value: 1567190711,
            display_type: 'number',
          },
        ],
      }),
    }
  })
})

let mockOnChainLockOwnership = {
  owner: jest.fn(() => {
    return Promise.resolve('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
  }),
}

jest.mock('../../src/utils/lockData', () => {
  return function() {
    return mockOnChainLockOwnership
  }
})

describe('Metadata Controller', () => {
  afterEach(async () => {
    await LockMetadata.truncate({ cascade: true })
    mockOnChainLockOwnership.owner = jest.fn(() => {
      return Promise.resolve('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
    })
  })

  describe('token data request', () => {
    describe("when persisted data doesn't exist", () => {
      it('returns wellformed data for Week in Ethereum News', async () => {
        expect.assertions(2)

        let response = await request(app)
          .get('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7/1')
          .set('Accept', 'json')

        expect(response.status).toBe(200)
        expect(response.body).toEqual(
          expect.objectContaining({
            description:
              "A Key to the 'Week in Ethereum News' lock. Unlock is a protocol for memberships. https://unlock-protocol.com/",
            image:
              'https://assets.unlock-protocol.com/nft-images/week-in-ethereum.png',
            name: 'Unlock Key to Week in Ethereum News',
          })
        )
      })
    })

    describe('when the persisted data exists', () => {
      beforeAll(async () => {
        await LockMetadata.create({
          address: '0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691',
          data: {
            description: 'A Description for Persisted Lock Metadata',
            image: 'https://assets.unlock-protocol.com/logo.png',
            name: 'Persisted Lock Metadata',
          },
        })

        await KeyMetadata.create({
          address: '0x95de5F777A3e283bFf0c47374998E10D8A2183C7',
          id: '6',
          data: {
            custom_item: 'custom value',
          },
        })
      })

      afterAll(async () => {
        await LockMetadata.truncate({ cascade: true })
        await KeyMetadata.truncate()
      })

      it('returns data from the data store', async () => {
        expect.assertions(2)
        let response = await request(app)
          .get('/api/key/0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691/1')
          .set('Accept', 'json')

        expect(response.status).toBe(200)
        expect(response.body).toEqual(
          expect.objectContaining({
            description: 'A Description for Persisted Lock Metadata',
            image: 'https://assets.unlock-protocol.com/logo.png',
            name: 'Persisted Lock Metadata',
          })
        )
      })

      it('returns key specific information when available', async () => {
        expect.assertions(2)
        let response = await request(app)
          .get('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7/6')
          .set('Accept', 'json')

        expect(response.status).toBe(200)
        expect(response.body).toEqual(
          expect.objectContaining({
            description:
              "A Key to the 'Week in Ethereum News' lock. Unlock is a protocol for memberships. https://unlock-protocol.com/",
            image:
              'https://assets.unlock-protocol.com/nft-images/week-in-ethereum.png',
            name: 'Unlock Key to Week in Ethereum News',
            custom_item: 'custom value',
          })
        )
      })
    })
  })

  describe('updateDefaults', () => {
    let typedData: any

    beforeAll(() => {
      typedData = generateTypedData({
        LockMetaData: {
          name: 'An awesome Lock',
          description: 'we are chilling and such',
          address: '0x95de5F777A3e283bFf0c47374998E10D8A2183C7',
          owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
          image: 'http://image.location.url',
        },
      })
    })

    describe('when the signee does not own the lock', () => {
      beforeEach(() => {
        mockOnChainLockOwnership.owner = jest.fn(() => {
          return Promise.resolve(
            '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdfegdrtfeghr'
          )
        })
      })

      it('returns unauthorized', async () => {
        expect.assertions(1)
        const sig = sigUtil.signTypedData(privateKey, {
          data: typedData,
          from: '',
        })

        let response = await request(app)
          .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toEqual(401)
      })
    })

    describe('when the signee owns the lock', () => {
      beforeAll(() => {
        mockOnChainLockOwnership.owner = jest.fn(() => {
          return Promise.resolve('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
        })
      })

      it('stores the provided lock metadata', async () => {
        expect.assertions(1)
        const sig = sigUtil.signTypedData(privateKey, {
          data: typedData,
          from: '',
        })

        let response = await request(app)
          .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toEqual(202)
      })

      describe('when signature does not match', () => {
        it('return an Unauthorized status code', async () => {
          expect.assertions(1)
          const sig = sigUtil.signTypedData(privateKey2, {
            data: typedData,
            from: '',
          })

          let response = await request(app)
            .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7')
            .set('Accept', 'json')
            .set('Authorization', `Bearer ${Base64.encode(sig)}`)
            .send(typedData)

          expect(response.status).toEqual(401)
        })
      })
    })
  })

  describe('updateKeyMetadata', () => {
    describe('when the signee does not own the lock', () => {
      let typedData: any
      beforeAll(() => {
        typedData = generateKeyTypedData({
          KeyMetaData: {
            custom_field: 'custom value',
            owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
          },
        })

        mockOnChainLockOwnership.owner = jest.fn(() => {
          return Promise.resolve(
            '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdfegdrtfeghr'
          )
        })
      })

      it('returns unauthorized', async () => {
        expect.assertions(1)

        const sig = sigUtil.signTypedData(privateKey, {
          data: typedData,
          from: '',
        })

        let response = await request(app)
          .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7/5')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toEqual(401)
      })
    })
  })

  describe('updating address holder metadata', () => {
    it('stores the passed data', async () => {
      expect.assertions(1)

      let typedData = generateKeyTypedData({
        UserMetaData: {
          owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
          data: {
            emailAddress: 'emailAddress@example.com',
          },
        },
      })

      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
        from: '',
      })

      let response = await request(app)
        .put(
          '/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7/user/0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
        )
        .set('Accept', 'json')
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toEqual(202)
    })

    it('should update existing data if it already exists', async () => {
      expect.assertions(1)

      let typedData = generateKeyTypedData({
        UserMetaData: {
          owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
          data: {
            emailAddress: 'updatedEmailAddress@example.com',
          },
        },
      })

      const sig = sigUtil.signTypedData(privateKey, {
        data: typedData,
        from: '',
      })

      let response = await request(app)
        .put(
          '/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7/user/0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
        )
        .set('Accept', 'json')
        .set('Authorization', `Bearer ${Base64.encode(sig)}`)
        .send(typedData)

      expect(response.status).toEqual(202)
    })

    describe('when an invalid signature is passed', () => {
      it('', async () => {
        expect.assertions(1)

        let typedData = generateKeyTypedData({
          UserMetaData: {
            owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
            data: {
              emailAddress: 'updatedEmailAddress@example.com',
            },
          },
        })

        const sig = sigUtil.signTypedData(privateKey, {
          data: typedData,
          from: '',
        })

        let response = await request(app)
          .put(
            '/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7/user/0x6f7a54d6629b7416e17fc472b4003ae8ef18ef4c'
          )
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toEqual(401)
      })
    })
  })

  describe('when the signee owns the lock', () => {
    let typedData: any
    beforeAll(() => {
      typedData = generateKeyTypedData({
        KeyMetaData: {
          custom_field: 'custom value',
          owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        },
      })

      mockOnChainLockOwnership.owner = jest.fn(() => {
        return Promise.resolve('0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2')
      })
    })

    describe('when missing relevant signature details', () => {
      it('returns as unauthorized', async () => {
        expect.assertions(1)

        let response = await request(app)
          .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7/5')
          .set('Accept', 'json')
          .send(typedData)

        expect(response.status).toEqual(401)
      })
    })

    describe('when including signature details', () => {
      it('stores the provided key metadata', async () => {
        expect.assertions(1)

        const sig = sigUtil.signTypedData(privateKey, {
          data: typedData,
          from: '',
        })

        let response = await request(app)
          .put('/api/key/0x95de5F777A3e283bFf0c47374998E10D8A2183C7/5')
          .set('Accept', 'json')
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toEqual(202)
      })
    })
  })
})
