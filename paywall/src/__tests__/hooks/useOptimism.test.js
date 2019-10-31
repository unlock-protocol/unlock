import React from 'react'
import * as rtl from '@testing-library/react'

import useOptimism from '../../hooks/useOptimism'
import { WindowContext } from '../../hooks/browser/useWindow'
import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'
import { fakeLocksmithFetch } from '../test-helpers/helpers'

const WindowProvider = WindowContext.Provider
const ConfigProvider = ConfigContext.Provider
const config = configure()

jest.useFakeTimers()

describe('useOptimism hook', () => {
  let transaction
  let fakeWindow
  let finishFetch
  let fakeResponse

  function MakeOptimism() {
    const result = useOptimism(transaction)

    return <div>{JSON.stringify(result)}</div>
  }

  function MockOptimism() {
    return (
      <WindowProvider value={fakeWindow}>
        <ConfigProvider value={config}>
          <MakeOptimism />
        </ConfigProvider>
      </WindowProvider>
    )
  }

  beforeEach(() => {
    fakeResponse = {
      willSucceed: 1,
    }
    fakeWindow = {}
    fakeLocksmithFetch(fakeWindow, resolve => (finishFetch = resolve))
    transaction = {
      hash: '0x123',
      status: 'pending',
    }
  })

  it('returns the result of useLocksmith', () => {
    expect.assertions(1)

    let wrapper
    rtl.act(() => {
      wrapper = rtl.render(<MockOptimism />)
    })

    expect(
      wrapper.getByText(JSON.stringify({ current: 1, past: 0 }))
    ).not.toBeNull()
  })

  it('polls again after 15 seconds', () => {
    expect.assertions(4)

    let wrapper
    rtl.act(() => {
      wrapper = rtl.render(<MockOptimism />)
      finishFetch(fakeResponse)
      // ensure we are calling for the new fetcher
      finishFetch = () => {}
    })

    expect(
      wrapper.getByText(JSON.stringify({ current: 1, past: 0 }))
    ).not.toBeNull()
    expect(fakeWindow.fetch).toHaveBeenCalledTimes(1)

    fakeResponse = {
      willSucceed: 0,
    }

    rtl.act(() => {
      jest.runOnlyPendingTimers()
    })

    rtl.act(() => {
      // initially this was combined with the pending timer run above, but
      // finishFetch is not set until after leaving the rtl.act,
      // so it must be in its own block to pass
      finishFetch(fakeResponse)
    })
    expect(fakeWindow.fetch).toHaveBeenCalledTimes(2)

    expect(
      wrapper.getByText(JSON.stringify({ current: 0, past: 1 }))
    ).not.toBeNull()
  })

  it('does not fetch if transaction status is not pending', () => {
    expect.assertions(1)

    transaction.status = 'mined'

    rtl.act(() => {
      rtl.render(<MockOptimism />)
    })

    expect(fakeWindow.fetch).not.toHaveBeenCalled()
  })

  it('stops polling if transaction.status is no longer pending', () => {
    expect.assertions(4)

    let wrapper
    rtl.act(() => {
      wrapper = rtl.render(<MockOptimism />)
      finishFetch(fakeResponse)
      // ensure we are calling for the new fetcher
      finishFetch = () => {}
    })

    expect(
      wrapper.getByText(JSON.stringify({ current: 1, past: 0 }))
    ).not.toBeNull()
    expect(fakeWindow.fetch).toHaveBeenCalledTimes(1)

    fakeResponse = {
      willSucceed: 0,
    }

    transaction.status = 'mined'
    rtl.act(() => {
      jest.runOnlyPendingTimers()
    })

    expect(fakeWindow.fetch).toHaveBeenCalledTimes(1)
    expect(
      wrapper.getByText(JSON.stringify({ current: 1, past: 0 }))
    ).not.toBeNull()
  })

  it('does nothing if transaction is not set', () => {
    expect.assertions(1)

    transaction = null

    rtl.act(() => {
      rtl.render(<MockOptimism />)
    })

    expect(fakeWindow.fetch).not.toHaveBeenCalled()
  })
})
