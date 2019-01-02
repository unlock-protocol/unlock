import { findPaywallUrl, DEFAULT_URL, findLocks } from "../src/script";

describe('script', () => {
  describe('findPaywallUrl', () => {
    let fakeDoc
    beforeEach(() => fakeDoc = {
      getElementsByTagName() {
        return [
          {
            getAttribute() {
              return 'foobar'
            }
          },
          {
            getAttribute() {
              return 'hooby/booby/static/paywall.js'
            }
          }
        ]
      }
    })

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
              }
            },
            {
              getAttribute() {
                return 'nope'
              }
            }
          ]
        }
      }
      expect(findPaywallUrl(fakeDoc)).toBe(DEFAULT_URL)
    })
  })

  it('findLocks', () => {
    const document = {
      querySelector: jest.fn(() => 'hi')
    }
    expect(findLocks(document)).toBe('hi')
    expect(document.querySelector).toHaveBeenCalledWith('meta[name=lock]')
  })
})