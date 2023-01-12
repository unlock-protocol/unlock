import { ethers } from 'ethers'
import request from 'supertest'
import { LockMetadata } from '../../../src/models/lockMetadata'
import { addMetadata } from '../../../src/operations/userMetadataOperations'
import * as Base64 from '../../../src/utils/base64'
import app from '../../app'
import { vi } from 'vitest'

const wallet = new ethers.Wallet(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

const lockOwningAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const lockAddress = '0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691'
const chain = 31337

function generateTypedData(message: any, messageKey: string) {
  return {
    types: {
      LockMetadata: [
        { name: 'address', type: 'address' },
        { name: 'owner', type: 'address' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'owners', type: 'address[]' },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'LockMetadata',
    message,
    messageKey,
  }
}

vi.mock('../../../src/utils/keyData', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        get: vi.fn().mockResolvedValue({
          owner: '0xabcd',
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

// eslint-disable-next-line
var mockWeb3Service = {
  isLockManager: vi.fn(() => Promise.resolve(false)),
}

vi.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
}))

describe('Metadata Controller', () => {
  afterEach(async () => {
    await LockMetadata.truncate({ cascade: true })
    mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(false))
  })

  describe('requesting key holder metadata', () => {
    beforeAll(async () => {
      await addMetadata({
        chain,
        tokenAddress: lockAddress,
        userAddress: lockOwningAddress,
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

    describe('when the lock owner makes a signed request', () => {
      it.skip('returns the metadata', async () => {
        expect.assertions(2)

        mockWeb3Service.isLockManager = vi.fn(() => Promise.resolve(true))

        const typedData = generateTypedData(
          {
            LockMetaData: {
              address: lockAddress,
              owner: lockOwningAddress,
              timestamp: Date.now(),
              owners: ['0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'],
            },
          },
          'LockMetaData'
        )

        const { domain, types, message } = typedData
        const sig = await wallet._signTypedData(
          domain,
          types,
          message['LockMetaData']
        )

        const response = await request(app)
          .get(`/api/key/${lockAddress}/keyHolderMetadata?chain=${chain}`)
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .query({ data: encodeURIComponent(JSON.stringify(typedData)) })
          .set('Accept', 'json')

        const { userMetadata } = response.body[0].data

        expect(response.status).toBe(200)
        expect(userMetadata).toEqual({
          protected: { hidden: 'metadata' },
          public: { mock: 'values' },
        })
      })
    })

    describe('when an unsigned request is received', () => {
      it('returns unauthorized', async () => {
        expect.assertions(1)
        const response = await request(app)
          .get(`/api/key/${lockAddress}/keyHolderMetadata`)
          .set('Accept', 'json')

        expect(response.status).toBe(400)
      })
    })
  })
})
