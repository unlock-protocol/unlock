import {
  lockRoute,
  getRouteFromWindow,
  polyfilledURL,
} from '../../utils/routes'

describe('route utilities', () => {
  const baseRoute = {
    lockAddress: null,
    prefix: null,
    redirect: null,
    account: null,
    transaction: null,
    origin: null,
  }
  describe('lockRoute', () => {
    it('should return null value when it does not match', () => {
      expect.assertions(2)
      expect(lockRoute('/dashboard')).toEqual(baseRoute)
      expect(lockRoute('/lock')).toEqual(baseRoute)
    })

    it('should return the right prefix and lockAddress value when it matches', () => {
      expect.assertions(4)
      expect(
        lockRoute(
          '/lock/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/?origin=origin%2F'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'lock',
        origin: 'origin/',
      })

      expect(
        lockRoute(
          '/paywall/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54?origin=origin%2F'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'paywall',
        origin: 'origin/',
      })
      expect(
        lockRoute(
          '/page/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54?origin=origin%2F'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'page',
        origin: 'origin/',
      })
      expect(
        lockRoute(
          '/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54?origin=origin%2F'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        origin: 'origin/',
      })
    })

    it('should return the correct redirect parameter when it matches', () => {
      expect.assertions(1)
      expect(
        lockRoute(
          '/page/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere?origin=origin%2F'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'page',
        redirect: 'http://hithere',
        origin: 'origin/',
      })
    })

    it('should return the correct account parameter when it matches', () => {
      expect.assertions(2)
      expect(
        lockRoute(
          '/page/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere?origin=origin%2F#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'page',
        redirect: 'http://hithere',
        account: '0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        origin: 'origin/',
      })
      expect(
        lockRoute(
          '/page/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/?origin=origin%2F#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'page',
        account: '0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        origin: 'origin/',
      })
    })

    it('should return the correct transaction parameter when it matches', () => {
      expect.assertions(2)
      expect(
        lockRoute(
          '/page/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere?origin=origin%2F#0xd22ddf19c1ef9631e6c150b9260f9a4f2f7d4105fabf41d114eef2f0f1ae58d3'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'page',
        redirect: 'http://hithere',
        transaction:
          '0xd22ddf19c1ef9631e6c150b9260f9a4f2f7d4105fabf41d114eef2f0f1ae58d3',
        origin: 'origin/',
      })
      expect(
        lockRoute(
          '/page/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/?origin=origin%2F#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'page',
        account: '0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        origin: 'origin/',
      })
    })

    it('should ignore malformed account parameter', () => {
      expect.assertions(1)
      expect(
        lockRoute(
          // address is too short
          '/page/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere?origin=origin%2F#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'page',
        redirect: 'http://hithere',
        origin: 'origin/',
      })
    })

    it('should ignore malformed transaction parameter', () => {
      expect.assertions(1)
      expect(
        lockRoute(
          // address is too short
          '/page/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere?origin=origin%2F#0xd22ddf19c1ef9631e6c150b9260f9a4f2f7d4105fabf41d114eef2f0f1ae58dz'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'page',
        redirect: 'http://hithere',
        origin: 'origin/',
      })
    })

    it('should return account parameter if redirect is not present', () => {
      expect.assertions(1)

      expect(
        lockRoute(
          '/page/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54?origin=origin%2F#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54'
        )
      ).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'page',
        account: '0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        origin: 'origin/',
      })
    })

    it('should return the origin no matter what', () => {
      expect.assertions(1)

      expect(
        lockRoute(
          '/?origin=origin%2F#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54'
        )
      ).toEqual({
        ...baseRoute,
        origin: 'origin/',
      })
    })

    it('should not crash if there are no search params on polyfilled server URL', () => {
      expect.assertions(1)

      expect(lockRoute('/', polyfilledURL)).toEqual({
        ...baseRoute,
        origin: null,
      })
    })
  })

  describe('getRouteFromWindow', () => {
    it('should parse route from window.location', () => {
      expect.assertions(1)
      const fakeWindow = {
        location: {
          pathname:
            '/page/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere',
          search: '?origin=origin%2F',
          hash: '#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        },
      }
      expect(getRouteFromWindow(fakeWindow)).toEqual({
        ...baseRoute,
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'page',
        redirect: 'http://hithere',
        account: '0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        origin: 'origin/',
      })
    })
  })
})
