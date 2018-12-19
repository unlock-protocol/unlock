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
  })
})
