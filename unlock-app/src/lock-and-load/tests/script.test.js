import {
  findPaywallUrl,
  DEFAULT_URL,
  findLocks,
  getPaywallUrl,
} from '../src/script'

describe('script', () => {
  describe('findPaywallUrl', () => {
    let fakeDoc
    beforeEach(
      () =>
        (fakeDoc = {
          getElementsByTagName() {
            return [
              {
                getAttribute() {
                  return 'foobar'
                },
              },
              {
                getAttribute() {
                  return 'hooby/booby/static/paywall.min.js'
                },
              },
            ]
          },
        })
    )

    it('finds the correct attribute', () => {
      expect(findPaywallUrl(fakeDoc)).toBe('hooby/booby')
    })
    it('returns the default url if nothing is found', () => {
      fakeDoc = {
        getElementsByTagName() {
          return [
            {
              getAttribute() {
                return 'foobar'
              },
            },
            {
              getAttribute() {
                return 'nope'
              },
            },
          ]
        },
      }
      expect(findPaywallUrl(fakeDoc)).toBe(DEFAULT_URL)
    })
  })

  it('findLocks', () => {
    const el = {
      getAttribute() {
        return 'hi'
      },
    }
    const document = {
      querySelector: jest.fn(() => el),
    }
    expect(findLocks(document)).toBe('hi')
    expect(document.querySelector).toHaveBeenCalledWith('meta[name=lock]')
  })

  it('getPaywallUrl', () => {
    const window = {
      unlock_url: 'hi',
    }
    expect(getPaywallUrl(window)).toBe('hi')
  })
})
