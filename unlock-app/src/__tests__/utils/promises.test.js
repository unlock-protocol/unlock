import { delayPromise } from '../../utils/promises'

describe('delay', () => {
  it('should delay for the number of milliseconds specified', async () => {
    expect.assertions(3)

    jest.useFakeTimers()

    let delayed = 0
    delayPromise(100).then(time => {
      delayed = time
    })

    expect(delayed).toBe(0)
    jest.advanceTimersByTime(99)
    expect(delayed).toBe(0)
    jest.advanceTimersByTime(101)
    await Promise.resolve()

    expect(delayed).toBe(100)
  })
})
