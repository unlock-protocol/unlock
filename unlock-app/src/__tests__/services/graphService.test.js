import ApolloClient from 'apollo-boost'

import GraphService from '../../services/graphService'
import locksByOwner from '../../queries/locksByOwner'

jest.mock('apollo-boost')

let graphService
let graphEndpoint = 'https://graphEndpoint'
describe('GraphService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    graphService = new GraphService(graphEndpoint)
  })

  describe('locksByOwner', () => {
    const owner = '0xowner'
    it('should use the locksByOwner query to return the list of locks', async () => {
      expect.assertions(4)
      const locks = ['0xlock1', '0xlock2']

      expect(ApolloClient).toHaveBeenCalledTimes(1)
      const apolloClientMock = ApolloClient.mock.instances[0]
      apolloClientMock.query = jest.fn(() => {
        return Promise.resolve({
          data: {
            locks,
          },
        })
      })

      const onwerLocks = await graphService.locksByOwner(owner)

      expect(apolloClientMock.query).toHaveBeenCalledWith({
        query: locksByOwner(),
        variables: {
          owner,
        },
      })
      expect(graphService.client.query).toHaveBeenCalledTimes(1)
      expect(onwerLocks).toEqual(locks)
    })
  })
})
