import request from 'supertest'
import * as sigUtil from 'eth-sig-util'
import * as ethJsUtil from 'ethereumjs-util'
import { LockMetadata } from '../../../src/models/lockMetadata'
import { KeyMetadata } from '../../../src/models/keyMetadata'
import { addMetadata } from '../../../src/operations/userMetadataOperations'
import { lockTypedData } from '../../test-helpers/typeDataGenerators'

import app = require('../../../src/app')
import Base64 = require('../../../src/utils/base64')

const lockAddress = '0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691'
const lockOwner = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const keyOwner = '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8'
const weekInEthereumLockAddress = '0x95de5F777A3e283bFf0c47374998E10D8A2183C7'
const privateKey = ethJsUtil.toBuffer(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)
const keyHolderPrivateKey = ethJsUtil.toBuffer(
  '0xe5986c22698a3c1eb5f84455895ad6826fbdff7b82dbeee240bad0024469d93a'
)

const typedData = lockTypedData({
  LockMetaData: {
    address: lockAddress,
    owner: lockOwner,
    timestamp: Date.now(),
  },
})

const sig = sigUtil.signTypedData(privateKey, {
  data: typedData,
})

const keyHolderStructuredData = lockTypedData({
  LockMetaData: {
    address: lockAddress,
    owner: keyOwner,
    timestamp: Date.now(),
  },
})

const chain = 31337

const keyHolderSignature = sigUtil.signTypedData(keyHolderPrivateKey, {
  data: keyHolderStructuredData,
})

const mockOnChainLockOwnership = {
  getKeyOwner: jest.fn(() => {
    return Promise.resolve(keyOwner)
  }),
}

const mockKeyHoldersByLock = {
  getKeyHoldingAddresses: jest.fn(() => {
    return Promise.resolve(['0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'])
  }),
}

jest.mock('../../../src/utils/lockData', () => {
  return function mock() {
    return mockOnChainLockOwnership
  }
})

// eslint-disable-next-line
var mockWeb3Service = {
  isLockManager: jest.fn(() => Promise.resolve(false)),
}

jest.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
}))

jest.mock('../../../src/graphql/datasource/keyholdersByLock', () => ({
  __esModule: true,
  KeyHoldersByLock: jest.fn(() => {
    return mockKeyHoldersByLock
  }),
}))

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

describe('Requesting Token Data', () => {
  beforeAll(async () => {
    await LockMetadata.create({
      chain,
      address: lockAddress,
      data: {
        description: 'A Description for Persisted Lock Metadata',
        image: 'https://assets.unlock-protocol.com/logo.png',
        name: 'Persisted Lock Metadata',
      },
    })

    await KeyMetadata.create({
      chain,
      address: weekInEthereumLockAddress,
      id: '6',
      data: {
        custom_item: 'custom value',
      },
    })

    await addMetadata({
      chain,
      tokenAddress: lockAddress,
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

    mockWeb3Service.isLockManager = jest.fn(() => Promise.resolve(false))
  })

  describe("when persisted data doesn't exist", () => {
    it('returns wellformed data for Week in Ethereum News', async () => {
      expect.assertions(2)

      const response = await request(app)
        .get(`/api/key/${weekInEthereumLockAddress}/1`)
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
    afterAll(async () => {
      await LockMetadata.truncate({ cascade: true })
      await KeyMetadata.truncate()
    })

    it('returns data from the data store', async () => {
      expect.assertions(2)
      const response = await request(app)
        .get(`/api/key/${lockAddress}/1`)
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
      it('returns their payload in the response excluding the protected fields', async () => {
        expect.assertions(2)
        const response = await request(app)
          .get(`/api/key/${lockAddress}/1`)
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
          mockWeb3Service.isLockManager = jest.fn(() => Promise.resolve(true))
          const response = await request(app)
            .get(`/api/key/${lockAddress}/1`)
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

      describe('When the key holder has signed the request', () => {
        it('returns the protected metadata', async () => {
          expect.assertions(2)

          const response = await request(app)
            .get(`/api/key/${lockAddress}/1`)
            .set('Authorization', `Bearer ${Base64.encode(keyHolderSignature)}`)
            .set('Accept', 'json')
            .query({
              data: encodeURIComponent(JSON.stringify(keyHolderStructuredData)),
            })

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
