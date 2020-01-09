import ApolloClient from 'apollo-boost'
import { utils } from 'ethers'

import GraphService from '../../services/graphService'
import locksByOwner from '../../queries/locksByOwner'

jest.mock('apollo-boost')
jest.mock('ethers')

let graphService
const graphEndpoint = 'https://graphEndpoint'
describe('GraphService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    graphService = new GraphService(graphEndpoint)
  })

  describe('locksByOwner', () => {
    const owner = '0xowner'
    it('should use the locksByOwner query to return the list of locks', async () => {
      expect.assertions(5)
      const locks = [
        {
          address: '0xlock1',
        },
        {
          address: '0xlock2',
        },
      ]

      expect(ApolloClient).toHaveBeenCalledTimes(1)
      const apolloClientMock = ApolloClient.mock.instances[0]
      apolloClientMock.query = jest.fn(() => {
        return Promise.resolve({
          data: {
            locks,
          },
        })
      })

      utils.getAddress = jest.fn(address => {
        return address
      })

      const ownerLocks = await graphService.locksByOwner(owner)

      expect(utils.getAddress).toHaveBeenCalledTimes(2)
      expect(apolloClientMock.query).toHaveBeenCalledWith({
        query: locksByOwner(),
        variables: {
          owner,
        },
      })
      expect(graphService.client.query).toHaveBeenCalledTimes(1)
      expect(ownerLocks).toEqual(locks)
    })
  })
})
