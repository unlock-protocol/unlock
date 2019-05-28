import { delayPromise, waitFor } from '../../utils/promises'

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

  describe('waitFor', () => {
    it('should resolve when condition is truthy', async () => {
      expect.assertions(9)

      jest.useFakeTimers()

      let condition = false
      let resolved = false
      let conditionFunc = jest.fn(() => condition)

      waitFor(conditionFunc)
        .then(() => (resolved = true))
        .then(() => expect(condition).toBe(true))

      expect(setInterval).toHaveBeenCalled()
      // initial call
      expect(conditionFunc).toHaveBeenCalledTimes(1)
      expect(resolved).toBe(false)

      jest.runOnlyPendingTimers()
      // first call on the interval
      expect(conditionFunc).toHaveBeenCalledTimes(2)

      jest.runOnlyPendingTimers()
      // second call on the interval
      expect(conditionFunc).toHaveBeenCalledTimes(3)

      condition = true
      jest.runOnlyPendingTimers()
      // third call on the interval
      expect(conditionFunc).toHaveBeenCalledTimes(4)

      jest.runOnlyPendingTimers()
      // setInterval should be shut down, no additional calls
      expect(conditionFunc).toHaveBeenCalledTimes(4)

      await Promise.resolve()
      expect(resolved).toBe(true)
    })
  })

  it('should resolve immediately if condition is truthy on the start', async () => {
    expect.assertions(5)

    jest.useFakeTimers()

    let condition = true
    let resolved = false
    let conditionFunc = jest.fn(() => condition)

    waitFor(conditionFunc)
      .then(() => (resolved = true))
      .then(() => expect(condition).toBe(true))

    expect(setInterval).not.toHaveBeenCalled()
    // initial call
    expect(conditionFunc).toHaveBeenCalledTimes(1)
    await Promise.resolve()
    expect(resolved).toBe(true)

    jest.runOnlyPendingTimers()
    // first call on the interval
    expect(conditionFunc).toHaveBeenCalledTimes(1)
  })
})
