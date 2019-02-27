import * as rtl from 'react-testing-library'
import React from 'react'

import { ConfigContext } from '../../../hooks/utils/useConfig'
import useListenForPostMessage from '../../../hooks/browser/useListenForPostMessage'

describe('useListenForPostMessage hook', () => {
  const { Provider } = ConfigContext

  let fakeWindow
  let config

  function wrapper(props) {
    return <Provider value={config} {...props} />
  }

  beforeEach(() => {
    fakeWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      parent: {
        origin: 'origin',
      },
    }
    config = { isServer: false, isInIframe: true }
  })

  it('sets up the event listener', () => {
    expect.assertions(1)

    rtl.testHook(() => useListenForPostMessage(fakeWindow), {
      wrapper,
    })

    expect(fakeWindow.addEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function)
    )
  })

  it('only subscribes on mount, and not on update', () => {
    expect.assertions(1)

    const { rerender } = rtl.testHook(
      () => useListenForPostMessage(fakeWindow),
      {
        wrapper,
      }
    )

    rerender()

    expect(fakeWindow.addEventListener).toHaveBeenCalledTimes(1)
  })

  it('unsubscribes on unmount', () => {
    expect.assertions(1)

    const { unmount } = rtl.testHook(
      () => useListenForPostMessage(fakeWindow),
      {
        wrapper,
      }
    )

    unmount()

    expect(fakeWindow.removeEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function)
    )
  })

  it('ignores calls on the server', () => {
    expect.assertions(1)

    config.isServer = true

    rtl.testHook(() => useListenForPostMessage(fakeWindow), {
      wrapper,
    })

    expect(fakeWindow.addEventListener).not.toHaveBeenCalled()
  })

  it('ignores calls in the main window', () => {
    expect.assertions(1)

    config.isInIframe = false

    rtl.testHook(() => useListenForPostMessage(fakeWindow), {
      wrapper,
    })

    expect(fakeWindow.addEventListener).not.toHaveBeenCalled()
  })

  it('does not throw when window is not set', () => {
    expect.assertions(0)
    rtl.testHook(() => useListenForPostMessage(false), {
      wrapper,
    })
  })

  it('sets data when event is received', () => {
    expect.assertions(2)

    const { result } = rtl.testHook(() => useListenForPostMessage(fakeWindow), {
      wrapper,
    })

    const eventCallback = fakeWindow.addEventListener.mock.calls[0][1]

    expect(result.current).toBe(undefined)
    rtl.act(() =>
      eventCallback({
        source: fakeWindow.parent,
        origin: fakeWindow.parent.origin,
        data: 'data',
      })
    )

    expect(result.current).toBe('data')
  })

  describe('insecure postMessage events', () => {
    it('ignores source that is not the parent', () => {
      expect.assertions(2)

      const { result } = rtl.testHook(
        () => useListenForPostMessage(fakeWindow),
        {
          wrapper,
        }
      )

      const eventCallback = fakeWindow.addEventListener.mock.calls[0][1]

      expect(result.current).toBe(undefined)
      rtl.act(() =>
        eventCallback({
          source: fakeWindow.parent,
          origin: fakeWindow.parent.origin,
          data: 'data',
        })
      )
      rtl.act(() =>
        eventCallback({
          source: 'nope',
          origin: fakeWindow.parent.origin,
          data: 'next',
        })
      )

      expect(result.current).toBe('data')
    })
    it('ignores origin that is not the parent', () => {
      expect.assertions(2)

      const { result } = rtl.testHook(
        () => useListenForPostMessage(fakeWindow),
        {
          wrapper,
        }
      )

      const eventCallback = fakeWindow.addEventListener.mock.calls[0][1]

      expect(result.current).toBe(undefined)
      rtl.act(() =>
        eventCallback({
          source: fakeWindow.parent,
          origin: fakeWindow.parent.origin,
          data: 'data',
        })
      )
      rtl.act(() =>
        eventCallback({
          source: fakeWindow.parent,
          origin: 'nope',
          data: 'next',
        })
      )

      expect(result.current).toBe('data')
    })
  })
})
