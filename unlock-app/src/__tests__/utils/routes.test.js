import { lockRoute } from '../../utils/routes'

describe('lockRoute', () => {
  it('should return null value when it does not match', () => {
    expect(lockRoute('/dashboard')).toEqual({
      lockAddress: null,
      prefix: null,
      redirect: null,
    })
    expect(lockRoute('/lock')).toEqual({
      lockAddress: null,
      prefix: null,
      redirect: null,
    })
    expect(lockRoute('/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54')).toEqual({
      lockAddress: null,
      prefix: null,
      redirect: null,
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
})
