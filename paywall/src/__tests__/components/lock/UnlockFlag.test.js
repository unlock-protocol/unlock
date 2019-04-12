import { mapStateToProps } from '../../../components/lock/UnlockFlag'

const lock = { address: '0x4983D5ECDc5cc0E499c2D23BF4Ac32B982bAe53a' }
const locks = {
  [lock.address]: lock,
}
const router = {
  location: {
    pathname: `/paywall/${lock.address}/http%3a%2f%2fexample.com`,
    search: '?origin=http%3A%2F%2Fexample.com',
    hash: '',
  },
}

const account = { address: '0x1234567890123456789012345678901234567890' }

let futureDate = new Date()
futureDate.setYear(2019)
futureDate.setMonth(4)
futureDate.setDate(3)
futureDate = futureDate.getTime() / 1000

const keys = {
  aKey: {
    id: 'aKey',
    lock: lock.address,
    owner: account.address,
    expiration: futureDate,
  },
}

describe('UnlockFlag component', () => {
  describe('mapStateToProps', () => {
    it('should return the expiration date of the key, formatted', () => {
      expect.assertions(1)

      expect(mapStateToProps({ locks, keys, router, account })).toEqual({
        expiration: 'May 3, 2019',
      })
    })
  })
})
