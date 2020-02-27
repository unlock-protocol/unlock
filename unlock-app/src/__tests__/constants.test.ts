import { pageTitle } from '../constants'

describe('constants', () => {
  describe('pageTitle', () => {
    it('should return title correctly with no subtitle', () => {
      expect.assertions(1)
      expect(pageTitle()).toBe("Unlock: The Web's new business model")
    })

    it('should return title correctly a subtitle', () => {
      expect.assertions(1)
      expect(pageTitle('Foo')).toBe(
        "Foo | Unlock: The Web's new business model"
      )
    })
  })
})
