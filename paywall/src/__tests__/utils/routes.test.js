import { lockRoute, getRouteFromWindow } from '../../utils/routes'

describe('route utilities', () => {
  describe('lockRoute', () => {
    it('should return null value when it does not match', () => {
      expect.assertions(2)
      expect(lockRoute('/dashboard')).toEqual({
        lockAddress: null,
        prefix: null,
        redirect: null,
        account: null,
      })
      expect(lockRoute('/lock')).toEqual({
        lockAddress: null,
        prefix: null,
        redirect: null,
        account: null,
      })
    })

    it('should return the right prefix and lockAddress value when it matches', () => {
      expect.assertions(4)
      expect(
        lockRoute('/lock/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/')
      ).toEqual({
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'lock',
        redirect: undefined,
        account: undefined,
      })

      expect(
        lockRoute('/paywall/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54')
      ).toEqual({
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'paywall',
        redirect: undefined,
        account: undefined,
      })
      expect(
        lockRoute('/demo/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54')
      ).toEqual({
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'demo',
        redirect: undefined,
        account: undefined,
      })
      expect(lockRoute('/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54')).toEqual({
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: undefined,
        redirect: undefined,
        account: undefined,
      })
    })
    it('should return the correct redirect parameter when it matches', () => {
      expect.assertions(1)
      expect(
        lockRoute(
          '/demo/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere'
        )
      ).toEqual({
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'demo',
        redirect: 'http://hithere',
      })
    })
    it('should return the correct account parameter when it matches', () => {
      expect.assertions(2)
      expect(
        lockRoute(
          '/demo/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54'
        )
      ).toEqual({
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'demo',
        redirect: 'http://hithere',
        account: '0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
      })
      expect(
        lockRoute(
          '/demo/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54'
        )
      ).toEqual({
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'demo',
        redirect: undefined,
        account: '0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
      })
    })
    it('should ignore malformed account parameter', () => {
      expect.assertions(1)
      expect(
        lockRoute(
          // address is too short
          '/demo/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb'
        )
      ).toEqual({
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'demo',
        redirect: 'http://hithere',
        account: undefined,
      })
    })
    it('should return account parameter if redirect is not present', () => {
      expect.assertions(1)

      expect(
        lockRoute(
          '/demo/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54'
        )
      ).toEqual({
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'demo',
        redirect: undefined,
        account: '0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
      })
    })
  })
  describe('getRouteFromWindow', () => {
    it('should parse route from window.location', () => {
      expect.assertions(1)
      const fakeWindow = {
        location: {
          pathname:
            '/demo/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/http%3a%2f%2fhithere',
          hash: '#0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        },
      }
      expect(getRouteFromWindow(fakeWindow)).toEqual({
        lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        prefix: 'demo',
        redirect: 'http://hithere',
        account: '0xaaa8825a3e7Fb15263D0DD455B8aAfc08503bb54',
      })
    })
  })
})
