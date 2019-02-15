import * as rtl from 'react-testing-library'
import usePoll from '../../../hooks/utils/usePoll'

jest.useFakeTimers()

describe('usePoll hook', () => {
  beforeEach(() => setTimeout.mockClear())
  it('calls setTimeout with the polling function and delay', () => {
    expect.assertions(3)
    const pollingFunction = jest.fn()

    rtl.testHook(() => usePoll(pollingFunction, 100))

    expect(setTimeout).toHaveBeenCalledTimes(2)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 100)
    expect(pollingFunction).not.toHaveBeenCalled()
  })

  it('calls effect only on mount, and not on update', () => {
    expect.assertions(2)
    const pollingFunction = jest.fn()

    const { rerender } = rtl.testHook(() => usePoll(pollingFunction, 100))

    expect(setTimeout).toHaveBeenCalledTimes(2)

    rerender()

    expect(setTimeout).toHaveBeenCalledTimes(2)
  })

  it('calls the polling function every interval', () => {
    expect.assertions(4)
    const pollingFunction = jest.fn()

    rtl.testHook(() => usePoll(pollingFunction, 100))

    expect(pollingFunction).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(pollingFunction).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(99)
    expect(pollingFunction).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1)
    expect(pollingFunction).toHaveBeenCalledTimes(2)
  })

  it('clears the timeout when unmounted', () => {
    expect.assertions(2)
    const pollingFunction = jest.fn()

    const { unmount } = rtl.testHook(() => usePoll(pollingFunction, 100))
    jest.advanceTimersByTime(99)

    unmount()

    jest.advanceTimersByTime(2)
    expect(pollingFunction).not.toHaveBeenCalled()
    expect(clearTimeout).toHaveBeenCalled()
  })
})
