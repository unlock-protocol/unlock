import { keysByQuery } from '../../../src/graphql/datasource/keysByQuery'

const network = 4
const lockAddress = '0x62ccb13a72e6f991de53b9b7ac42885151588cd2'
describe('keysByQuery', () => {
  it('test function', async () => {
    expect.assertions(1)
    const graphQLClient = new keysByQuery(network)

    const [lock] = await graphQLClient.get({
      addresses: [lockAddress],
      filters: {
        query: '',
        filterKey: 'owner',
        expiration: 'active',
        page: 0,
      },
    })
    console.log(lock)

    expect(lock.name).toBe('New Lock 3')
    expect(lock.address).toBe(lockAddress)
  })
})
