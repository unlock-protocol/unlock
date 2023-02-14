import { delayPromise } from '../../utils/promises'
import { vi } from 'vitest'

describe('promises', () => {
  describe('delayPromise', () => {
    it('should delay for the number of milliseconds specified', async () => {
      expect.assertions(3)

      vi.useFakeTimers()

      let delayed = 0
      const time = delayPromise(100)

      expect(delayed).toBe(0)
      vi.advanceTimersByTime(99)
      expect(delayed).toBe(0)
      vi.advanceTimersByTime(101)
      delayed = await time

      expect(delayed).toBe(100)
    })
  })
})
