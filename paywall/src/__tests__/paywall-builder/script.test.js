import {
  findPaywallUrl,
  DEFAULT_URL,
  findLocks,
} from '../../paywall-builder/script'

function makeFakeScript(src, domain) {
  return {
    getAttribute(attr) {
      if (attr === 'src') return src
      if (attr === 'data-unlock-url') return domain
      return ''
    },
  }
}

describe('script', () => {
  describe('findPaywallUrl', () => {
    let fakeDoc
    beforeEach(
      () =>
        (fakeDoc = {
          getElementsByTagName() {
            return [
              makeFakeScript('foobar'),
              makeFakeScript('hooby/booby/static/paywall.min.js'),
            ]
          },
        })
    )

    it('finds the correct attribute', () => {
      expect.assertions(1)
      expect(findPaywallUrl(fakeDoc)).toBe('hooby/booby')
    })
    it('returns the default url if nothing is found', () => {
      expect.assertions(1)
      fakeDoc = {
        getElementsByTagName() {
          return [makeFakeScript('foobar'), makeFakeScript('nope')]
        },
      }
      expect(findPaywallUrl(fakeDoc)).toBe(DEFAULT_URL)
    })
    it('returns data-unlock-src if present', () => {
      expect.assertions(1)
      fakeDoc = {
        getElementsByTagName() {
          return [
            makeFakeScript('foobar'),
            makeFakeScript('/static/paywall/nope', 'hi'),
          ]
        },
      }
      expect(findPaywallUrl(fakeDoc)).toBe('hi')
    })
  })

  it('findLocks', () => {
    expect.assertions(2)
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
})
