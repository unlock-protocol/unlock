import { ethers } from 'ethers'
import request from 'supertest'
import { LockMetadata } from '../../../src/models/lockMetadata'
import { KeyMetadata } from '../../../src/models/keyMetadata'
import { addMetadata } from '../../../src/operations/userMetadataOperations'
import { lockTypedData } from '../../test-helpers/typeDataGenerators'
import app from '../../app'
import { vi } from 'vitest'
import * as Base64 from '../../../src/utils/base64'

const lockAddress = '0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691'
const lockOwner = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const keyOwner = '0xc66ef2e0d0edcce723b3fdd4307db6c5f0dda1b8'
const weekInEthereumLockAddress = '0x95de5F777A3e283bFf0c47374998E10D8A2183C7'
const wallet = new ethers.Wallet(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)
const keyHolderWallet = new ethers.Wallet(
  '0xe5986c22698a3c1eb5f84455895ad6826fbdff7b82dbeee240bad0024469d93a'
)

const typedData = lockTypedData(
  {
    LockMetaData: {
      address: lockAddress,
      owner: lockOwner,
      timestamp: Date.now(),
    },
  },
  'LockMetaData'
)

const keyHolderStructuredData = lockTypedData(
  {
    LockMetaData: {
      address: lockAddress,
      owner: keyOwner,
      timestamp: Date.now(),
    },
  },
  'LockMetaData'
)

const chain = 31337

const mockOnChainLockOwnership = {
  getKeyOwner: vi.fn(() => {
    return Promise.resolve(keyOwner)
  }),
}

vi.mock('../../../src/utils/lockData', () => {
  function mock() {
    return mockOnChainLockOwnership
  }
  return {
    default: mock,
  }
})

// eslint-disable-next-line
var mockWeb3Service = {
  isLockManager: vi.fn(() => Promise.resolve(false)),
}

vi.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
}))

vi.mock('../../../src/utils/keyData', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        get: vi.fn().mockResolvedValue({
          owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
          expiration: 1567190711,
        }),
        openSeaPresentation: vi.fn().mockReturnValue({
          attributes: [
            {
              trait_type: 'expiration',
              value: 1567190711,
              display_type: 'number',
            },
          ],
        }),
      }
    }),
  }
})

describe('Requesting Token Data', () => {
  beforeAll(async () => {
    await LockMetadata.destroy({
      where: {},
      truncate: true,
    })
    await KeyMetadata.destroy({
      where: {},
      truncate: true,
    })

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
      userAddress: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
      data: {
        protected: {
          hidden: 'metadata',
        },
        public: {
          mock: 'values',
        },
      },
    })

    mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(false))
  })

  describe("when persisted data doesn't exist", () => {
    it.skip('returns wellformed data for Week in Ethereum News', async () => {
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

    it.skip('returns key specific information when available', async () => {
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
          mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(true))

          const { domain, types, message } = typedData
          const sig = await wallet._signTypedData(
            domain,
            types,
            message['LockMetaData']
          )

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

          const { domain, types, message } = keyHolderStructuredData
          const keyHolderSignature = await keyHolderWallet._signTypedData(
            domain,
            types,
            message['LockMetaData']
          )
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
