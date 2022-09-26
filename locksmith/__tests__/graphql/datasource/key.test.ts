import { Key } from '../../../src/graphql/datasource'

const TEST_KEY_ID = '0x0035807ec068737973d603a1f7e0fc1b12a78bf8-1'
// Rinkeby
const TEST_NETWORK = 4
describe.skip('Key', () => {
  describe('getKey', () => {
    describe('when data is returned for the data source', () => {
      it('return the requested data', async () => {
        expect.assertions(1)
        // Instead of mocking, we make request to a known key on rinkeby network
        const key = new Key(TEST_NETWORK)
        const response = await key.getKey(TEST_KEY_ID)
        expect(response.id).toEqual(TEST_KEY_ID)
      })
    })

    describe('when an error occurs in data fetch', () => {
      it('returns an empty collection', async () => {
        expect.assertions(1)
        const key = new Key(TEST_NETWORK)
        const response = await key.getKey('non-existent-key')
        expect(response).toBe(null)
      })
    })
  })

  describe('getKeys', () => {
    describe('when data is returned for the data source', () => {
      it('return many keys using getKeys', async () => {
        expect.assertions(1)
        const key = new Key(TEST_NETWORK)
        const response = await key.getKeys({ first: 5 })
        expect(response.length).toBe(5)
      })
    })
  })
})
