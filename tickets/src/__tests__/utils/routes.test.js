import { lockRoute, rsvpRoute } from '../../utils/routes'

describe('route utilities', () => {
  const baseRoute = {
    lockAddress: null,
    prefix: null,
  }
  const rsvpBaseRoute = {
    signature: null,
    publicKey: null,
    lockAddress: null,
    prefix: null,
  }
  describe('lockRoute', () => {
    it('should return null value when it does not match', () => {
      expect.assertions(2)
      expect(lockRoute('/dashboard')).toEqual(baseRoute)
      expect(lockRoute('/lock')).toEqual(baseRoute)
    })

    it('should return the right prefix and lockAddress value when it matches', () => {
      expect.assertions(1)
      expect(
        lockRoute('/lock/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/')
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'lock',
      })
    })
  })
  describe('rsvpRoute', () => {
    it('should return null value when it does not match', () => {
      expect.assertions(2)
      expect(rsvpRoute('/dashboard')).toEqual(rsvpBaseRoute)
      expect(rsvpRoute('/lock')).toEqual(rsvpBaseRoute)
    })

    it('should return the right prefix and lockAddress value when it matches', () => {
      expect.assertions(1)
      expect(
        rsvpRoute(
          '/checkin/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/0x80b8825a3e7Fb15263D0DD455B8aAfc08503bb54/MMdskljfsdIOJWERO79b8825a3e7Fb15263D0DD455B8aAfc08503bb54d23493439'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        publicKey: '0x80b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        signature:
          'MMdskljfsdIOJWERO79b8825a3e7Fb15263D0DD455B8aAfc08503bb54d23493439',
        prefix: 'checkin',
      })
    })
  })
})
