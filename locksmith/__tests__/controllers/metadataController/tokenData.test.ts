import request from 'supertest'
import * as sigUtil from 'eth-sig-util'
import * as ethJsUtil from 'ethereumjs-util'
import { LockMetadata } from '../../../src/models/lockMetadata'
import { KeyMetadata } from '../../../src/models/keyMetadata'
import { addMetadata } from '../../../src/operations/userMetadataOperations'

const app = require('../../../src/app')
const Base64 = require('../../../src/utils/base64')

const privateKey = ethJsUtil.toBuffer(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

jest.mock('../../../src/utils/keyData', () => {
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

const mockOnChainLockOwnership = {
  owner: jest.fn(() => {
    return Promise.resolve('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
  }),
}

jest.mock('../../../src/utils/lockData', () => {
  return function() {
    return mockOnChainLockOwnership
  }
})

const mockKeyHoldersByLock = {
  getKeyHoldingAddresses: jest.fn(() => {
    return Promise.resolve(['0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'])
  }),
}

jest.mock('../../../src/graphql/datasource/keyholdersByLock', () => ({
  __esModule: true,
  KeyHoldersByLock: jest.fn(() => {
    return mockKeyHoldersByLock
  }),
}))

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
    message,
  }
}

describe('token data request', () => {
  describe("when persisted data doesn't exist", () => {
    it('returns wellformed data for Week in Ethereum News', async () => {
      expect.assertions(2)

      const response = await request(app)
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
      const response = await request(app)
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
      const response = await request(app)
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

  describe('when the user has provided metadata', () => {
    describe('when the user has provided public & protected metadata', () => {
      beforeEach(async () => {
        await addMetadata({
          tokenAddress: '0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691',
          userAddress: '0xaBCD',
          data: {
            protected: {
              hidden: 'metadata',
            },
            public: {
              mock: 'values',
            },
          },
        })
      })

      it('returns their payload in the response excluding the protected fields', async () => {
        expect.assertions(2)
        const response = await request(app)
          .get('/api/key/0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691/1')
          .set('Accept', 'json')

        expect(response.status).toBe(200)
        expect(response.body).toEqual(
          expect.objectContaining({
            description:
              'A Key to an Unlock lock. Unlock is a protocol for memberships. https://unlock-protocol.com/',
            userMetadata: { public: { mock: 'values' } },
          })
        )
      })

      describe('when the lock owner has signed the request', () => {
        it('returns the protected metadata', async () => {
          expect.assertions(2)

          const typedData = generateKeyTypedData({
            LockMetaData: {
              address: '0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691',
              owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
              timestamp: Date.now(),
            },
          })

          const sig = sigUtil.signTypedData(privateKey, {
            data: typedData,
            from: '',
          })

          const response = await request(app)
            .get('/api/key/0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691/1')
            .set('Authorization', `Bearer ${Base64.encode(sig)}`)
            .set('Accept', 'json')
            .query({ data: encodeURIComponent(JSON.stringify(typedData)) })

          expect(response.status).toBe(200)
          expect(response.body).toEqual(
            expect.objectContaining({
              description:
                'A Key to an Unlock lock. Unlock is a protocol for memberships. https://unlock-protocol.com/',
              userMetadata: {
                protected: {
                  hidden: 'metadata',
                },
                public: { mock: 'values' },
              },
            })
          )
        })
      })
    })
  })
})
