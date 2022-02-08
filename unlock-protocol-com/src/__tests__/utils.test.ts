import { chunk } from '../utils/chunk'

describe('Test utilts', () => {
  describe('Test chunk', () => {
    it('Should create proper chunks of an array', () => {
      expect.assertions(2)
      const array = [2, 4, 6, 2, 6, 3, 6]
      const chunks = chunk(array, 2)
      expect(chunks.length).toBe(4)
      expect(chunks[0]).toEqual([2, 4])
    })
  })
})
