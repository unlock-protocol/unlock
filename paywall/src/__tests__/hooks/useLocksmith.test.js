import React from 'react'
import PropTypes from 'prop-types'
import * as rtl from 'react-testing-library'

import useLocksmith from '../../hooks/useLocksmith'
import { WindowContext } from '../../hooks/browser/useWindow'
import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'

const WindowProvider = WindowContext.Provider
const ConfigProvider = ConfigContext.Provider
const config = configure()

describe('useLocksmith hook', () => {
  let fakeWindow
  let fakeResponse
  let finishFetch
  let triggerNewFetch
  const fetchResponse = {
    json: () => fakeResponse,
  }

  function MockLocksmither({ api = '/hi' }) {
    const [result, reQuery] = useLocksmith(api)
    triggerNewFetch = reQuery

    return <div>{JSON.stringify(result)}</div>
  }

  MockLocksmither.propTypes = {
    api: PropTypes.string,
  }

  MockLocksmither.defaultProps = {
    api: '/hi',
  }

  beforeEach(() => {
    fakeResponse = {
      thing: '1',
    }
    fakeWindow = {
      fetch: jest.fn(() => {
        return {
          then: cb => {
            finishFetch = cb
            return {
              catch: () => {},
            }
          },
        }
      }),
    }
  })

  it('passes the correct URL to fetch', () => {
    expect.assertions(1)

    rtl.act(() => {
      rtl.render(
        <WindowProvider value={fakeWindow}>
          <ConfigProvider value={config}>
            <MockLocksmither />
          </ConfigProvider>
        </WindowProvider>
      )
    })

    rtl.act(() => {
      finishFetch(fetchResponse)
    })

    expect(fakeWindow.fetch).toHaveBeenCalledWith(config.locksmithUri + '/hi')
  })

  it('returns the response', () => {
    expect.assertions(1)

    let wrapper
    rtl.act(() => {
      wrapper = rtl.render(
        <WindowProvider value={fakeWindow}>
          <ConfigProvider value={config}>
            <MockLocksmither />
          </ConfigProvider>
        </WindowProvider>
      )
    })

    rtl.act(() => {
      finishFetch(fetchResponse)
    })

    expect(wrapper.getByText(JSON.stringify(fakeResponse))).not.toBeNull()
  })

  it('triggers a new fetch if refetch is called', () => {
    expect.assertions(1)

    rtl.act(() => {
      rtl.render(
        <WindowProvider value={fakeWindow}>
          <ConfigProvider value={config}>
            <MockLocksmither />
          </ConfigProvider>
        </WindowProvider>
      )
    })

    rtl.act(() => {
      finishFetch(fetchResponse)
    })

    rtl.act(() => {
      triggerNewFetch()
    })

    expect(fakeWindow.fetch).toHaveBeenCalledTimes(2)
  })
})
