import { delayPromise } from '../../utils/promises'

describe('promises', () => {
  describe('delayPromise', () => {
    it('should delay for the number of milliseconds specified', async () => {
      expect.assertions(3)

      jest.useFakeTimers()

      let delayed = 0
      let time = delayPromise(100)

      expect(delayed).toBe(0)
      jest.advanceTimersByTime(99)
      expect(delayed).toBe(0)
      jest.advanceTimersByTime(101)
      delayed = await time

      expect(delayed).toBe(100)
    })
  })
})
