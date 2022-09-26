import { Lock } from '../../../src/graphql/datasource'

const TEST_LOCK_ID = '0x0035807ec068737973d603a1f7e0fc1b12a78bf8'
// Rinkeby
const TEST_NETWORK = 4

// TODO: never test against external services...
// These tests should be removed in favor of tests in the new subgraph
describe.skip('Lock', () => {
  describe('getLock', () => {
    describe('when data is returned for the data source', () => {
      it('return the requested data', async () => {
        expect.assertions(1)
        // Instead of mocking, we make request to a known lock on rinkeby network
        const lock = new Lock(TEST_NETWORK)
        const response = await lock.getLock(TEST_LOCK_ID)
        expect(response.id).toEqual(TEST_LOCK_ID)
      })
    })

    describe('when an error occurs in data fetch', () => {
      it('returns an null', async () => {
        expect.assertions(1)
        const lock = new Lock(TEST_NETWORK)
        const response = await lock.getLock('non-existent-lock')
        expect(response).toBe(null)
      })
    })
  })

  describe('getLocks', () => {
    describe('when data is returned for the data source', () => {
      it('return many locks using getLocks', async () => {
        expect.assertions(1)
        const lock = new Lock(TEST_NETWORK)
        const response = await lock.getLocks({ first: 5 })
        expect(response.length).toBe(5)
      })
    })
  })
})
