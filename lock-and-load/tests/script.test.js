import { findPaywallUrl } from "../src/script";

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
  })
})