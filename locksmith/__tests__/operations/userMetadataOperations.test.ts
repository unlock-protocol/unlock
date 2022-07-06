import {
  addMetadata,
  getMetadata,
} from '../../src/operations/userMetadataOperations'

const models = require('../../src/models')

const { UserTokenMetadata } = models

const chain = 31337

describe('userMetadataOperations', () => {
  beforeAll(async () => {
    await UserTokenMetadata.truncate()
  })
  describe('addMetadata', () => {
    describe('adding new metadata', () => {
      it('should persist the changes', async () => {
        expect.assertions(1)
        const metadataUpdate = addMetadata({
          chain,
          tokenAddress: '0x720b9F6D572C3CA4689E93CF029B40569c6b40e8',
          userAddress: '0xcFd35259E3A468E7bDF84a95bCddAc0B614A9212',
          data: {
            public: {
              name: 'Bruce wayne',
            },
            protected: {
              email: 'batman@email.com',
            },
          },
        })

        const result = await metadataUpdate

        expect(result[0]).toEqual(
          expect.objectContaining({
            data: {
              userMetadata: {
                public: { name: 'Bruce wayne' },
                protected: {
                  email: 'batman@email.com',
                },
              },
            },
            tokenAddress: '0x720b9F6D572C3CA4689E93CF029B40569c6b40e8',
            userAddress: '0xcFd35259E3A468E7bDF84a95bCddAc0B614A9212',
          })
        )
      })
    })

    describe('updating existing metadata', () => {
      it('should persist the changes', async () => {
        expect.assertions(1)
        const metadataUpdate = addMetadata({
          chain,
          tokenAddress: '0x720b9F6D572C3CA4689E93CF029B40569c6b40e8',
          userAddress: '0xcFd35259E3A468E7bDF84a95bCddAc0B614A9212',
          data: {
            public: { name: 'Clark Kent' },
          },
        })

        const result = await metadataUpdate

        expect(result[0]).toEqual(
          expect.objectContaining({
            data: {
              userMetadata: {
                public: {
                  name: 'Clark Kent',
                },
              },
            },
            tokenAddress: '0x720b9F6D572C3CA4689E93CF029B40569c6b40e8',
            userAddress: '0xcFd35259E3A468E7bDF84a95bCddAc0B614A9212',
          })
        )
      })
    })
  })

  describe('getMetadata', () => {
    describe("when metadata for the pair doesn't exist ", () => {
      it('returns null', async () => {
        expect.assertions(1)

        const metaData = await getMetadata(
          '0x720b9F6D572C3CA4689E93CF029B40569c6b40e8',
          '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
        )
        const result = await metaData
        expect(result).toBe(null)
      })
    })

    describe('when metadata for the pair exists', () => {
      it('returns the metadata', async () => {
        expect.assertions(1)

        const metaData = getMetadata(
          '0x720b9F6D572C3CA4689E93CF029B40569c6b40e8',
          '0xcFd35259E3A468E7bDF84a95bCddAc0B614A9212'
        )
        const result = await metaData

        expect(result).toEqual(
          expect.objectContaining({
            userMetadata: expect.anything(),
          })
        )
      })
    })
  })
})
