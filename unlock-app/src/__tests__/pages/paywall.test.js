import { mapStateToProps } from '../../pages/paywall'

describe('Paywall', () => {
  describe('mapStateToProps', () => {
    it('should yield the lock which matches the address of the demo page', () => {
      const lock = { address: '0x4983D5ECDc5cc0E499c2D23BF4Ac32B982bAe53a' }
      const locks = {
        [lock.address]: lock,
      }
      const router = {
        location: {
          pathname: `/paywall/${lock.address}`,
        },
      }
      const props = mapStateToProps({ locks, router })
      expect(props.lock).toBe(lock)
    })

    it('should pull the redirect parameter from the page', () => {
      const lock = { address: '0x4983D5ECDc5cc0E499c2D23BF4Ac32B982bAe53a' }
      const locks = {
        [lock.address]: lock,
      }
      const router = {
        location: {
          pathname: `/paywall/${lock.address}/http%3A%2F%2Fexample.com`,
        },
      }
      const props = mapStateToProps({ locks, router })
      expect(props.redirect).toBe('http://example.com')
    })
  })
})
