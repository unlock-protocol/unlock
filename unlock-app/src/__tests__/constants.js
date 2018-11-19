import { pageTitle } from '../constants'

describe('constants', () => {
  describe('pageTitle', () => {
    it('should return title correctly with no subtitle', () => {
      expect(pageTitle()).toBe('Unlock: The Web\'s new business model')
    })
    it('should return title correctly a subtitle', () => {
      expect(pageTitle('Foo')).toBe(
        'Foo | Unlock: The Web\'s new business model'
      )
    })
  })
})
