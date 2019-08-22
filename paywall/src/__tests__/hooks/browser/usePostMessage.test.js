import * as rtl from 'react-testing-library'
import React from 'react'

import { ConfigContext } from '../../../utils/withConfig'
import usePostMessage from '../../../hooks/browser/usePostMessage'
import { WindowContext } from '../../../hooks/browser/useWindow'

describe('usePostMessage hook', () => {
  let fakeWindow
  let config
  let postMessage

  function MockPostMessage() {
    const { postMessage: ret } = usePostMessage()
    postMessage = ret
    return <div>unused</div>
  }

  function Wrapper() {
    return (
      <WindowContext.Provider value={fakeWindow}>
        <ConfigContext.Provider value={config}>
          <MockPostMessage />
        </ConfigContext.Provider>
      </WindowContext.Provider>
    )
  }

  beforeEach(() => {
    fakeWindow = {
      parent: {
        postMessage: jest.fn(),
      },
      location: {
        pathname: '/page/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        search: '?origin=origin',
        hash: '',
      },
    }
    config = { isServer: false, isInIframe: true }
  })

  it('posts a message to the window parent when postMessage is called', () => {
    expect.assertions(2)

    rtl.render(<Wrapper />)

    expect(typeof postMessage).toBe('function')
    rtl.act(() => {
      postMessage('hi')
    })
    expect(fakeWindow.parent.postMessage).toHaveBeenCalledWith('hi', 'origin')
  })
  it('ignores calls on the server', () => {
    expect.assertions(1)

    config.isServer = true

    rtl.render(<Wrapper />)

    rtl.act(() => {
      postMessage('hi')
    })
    expect(fakeWindow.parent.postMessage).not.toHaveBeenCalled()
  })
  it('ignores calls in the main window', () => {
    expect.assertions(1)

    config.isInIframe = false

    rtl.render(<Wrapper />)

    rtl.act(() => {
      postMessage('hi')
    })
    expect(fakeWindow.parent.postMessage).not.toHaveBeenCalled()
  })
  it('ignores calls with an empty message', () => {
    expect.assertions(1)

    rtl.render(<Wrapper />)

    rtl.act(() => {
      postMessage()
    })
    expect(fakeWindow.parent.postMessage).not.toHaveBeenCalled()
  })
  it('ignores calls with an empty origin', () => {
    expect.assertions(1)

    fakeWindow.location.search = '' // remove origin

    rtl.render(<Wrapper />)

    rtl.act(() => {
      postMessage()
    })
    expect(fakeWindow.parent.postMessage).not.toHaveBeenCalled()
  })
  it('does not call postMessage twice with the same message', () => {
    expect.assertions(1)

    rtl.render(<Wrapper />)

    rtl.act(() => {
      postMessage('hi')
    })
    rtl.act(() => {
      postMessage('hi')
    })

    expect(fakeWindow.parent.postMessage).toHaveBeenCalledTimes(1)
  })
  it('does call postMessage when the message changes', () => {
    expect.assertions(2)

    rtl.render(<Wrapper />)

    rtl.act(() => {
      postMessage('hi')
      postMessage('hi')
      postMessage('bye')
    })
    expect(fakeWindow.parent.postMessage).toHaveBeenCalledTimes(2)
    expect(fakeWindow.parent.postMessage).toHaveBeenLastCalledWith(
      'bye',
      'origin'
    )
  })
})
