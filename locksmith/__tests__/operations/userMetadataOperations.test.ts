// import * as Sequelize from 'sequelize'
import addMetadata from '../../src/operations/userMetadataOperations'

const models = require('../../src/models')

const { UserTokenMetadata } = models

describe('userMetadataOperations', () => {
  beforeAll(async () => {
    await UserTokenMetadata.truncate()
  })
  describe('addMetadata', () => {
    describe('adding new metadata', () => {
      it('should persist the changes', async () => {
        expect.assertions(1)
        let metadataUpdate = addMetadata({
          tokenAddress: '0x720b9F6D572C3CA4689E93CF029B40569c6b40e8',
          userAddress: '0xcFd35259E3A468E7bDF84a95bCddAc0B614A9212',
          data: {
            name: 'Bruce wayne',
          },
        })

        let result = await metadataUpdate

        expect(result[0]).toEqual(
          expect.objectContaining({
            data: { userMetadata: { name: 'Bruce wayne' } },
            tokenAddress: '0x720b9F6D572C3CA4689E93CF029B40569c6b40e8',
            userAddress: '0xcFd35259E3A468E7bDF84a95bCddAc0B614A9212',
          })
        )
      })
    })

    describe('updating existing metadata', () => {
      it('should persist the changes', async () => {
        expect.assertions(1)
        let metadataUpdate = addMetadata({
          tokenAddress: '0x720b9F6D572C3CA4689E93CF029B40569c6b40e8',
          userAddress: '0xcFd35259E3A468E7bDF84a95bCddAc0B614A9212',
          data: {
            name: 'Clark Kent',
          },
        })

        let result = await metadataUpdate

        expect(result[0]).toEqual(
          expect.objectContaining({
            data: { userMetadata: { name: 'Clark Kent' } },
            tokenAddress: '0x720b9F6D572C3CA4689E93CF029B40569c6b40e8',
            userAddress: '0xcFd35259E3A468E7bDF84a95bCddAc0B614A9212',
          })
        )
      })
    })
  })
})
