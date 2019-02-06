import { lockRoute } from '../../utils/routes'

describe('lockRoute', () => {
  it('should return null value when it does not match', () => {
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
    expect(lockRoute('/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54')).toEqual({
      lockAddress: null,
      prefix: null,
      redirect: null,
      account: null,
    })
  })

  it('should return the right prefix and lockAddress value when it matches', () => {
    expect(
      lockRoute('/lock/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54/')
    ).toEqual({
      lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
      prefix: 'lock',
      redirect: undefined,
    })

    expect(
      lockRoute('/paywall/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54')
    ).toEqual({
      lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
      prefix: 'paywall',
      redirect: undefined,
    })
    expect(
      lockRoute('/demo/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54')
    ).toEqual({
      lockAddress: '0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
      prefix: 'demo',
      redirect: undefined,
    })
  })
  it('should return the correct redirect parameter when it matches', () => {
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
  })
  it('should ignore malformed account parameter', () => {
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
