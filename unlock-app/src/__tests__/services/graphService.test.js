import ApolloClient from 'apollo-boost'
import { utils } from 'ethers'

import GraphService from '../../services/graphService'
import locksByManager from '../../queries/locksByManager'

jest.mock('apollo-boost')
jest.mock('ethers')

let graphService
const graphEndpoint = 'https://graphEndpoint'
describe('GraphService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    graphService = new GraphService(graphEndpoint)
  })

  describe('locksByManager', () => {
    const owner = '0xowner'
    it.skip('should use the locksByManager query to return the list of locks', async () => {
      expect.assertions(5)
      const lockManagers = [
        {
          lock: {
            address: '0xlock1',
          },
        },
        {
          lock: {
            address: '0xlock2',
          },
        },
      ]

      expect(ApolloClient).toHaveBeenCalledTimes(1)
      const apolloClientMock = ApolloClient.mock.instances[0]
      apolloClientMock.query = jest.fn(() => {
        return Promise.resolve({
          data: {
            lockManagers,
          },
        })
      })

      utils.getAddress = jest.fn((address) => {
        return address
      })

      const ownerLocks = await graphService.locksByManager(owner)

      expect(utils.getAddress).toHaveBeenCalledTimes(2)
      expect(apolloClientMock.query).toHaveBeenCalledWith({
        query: locksByManager(),
        variables: {
          owner,
        },
      })
      expect(graphService.client.query).toHaveBeenCalledTimes(1)
      expect(ownerLocks).toEqual(lockManagers.map((manager) => manager.lock))
    })
  })
})
