import * as rtl from 'react-testing-library'
import React from 'react'

import { ConfigContext } from '../../../utils/withConfig'
import useListenForPostMessage from '../../../hooks/browser/useListenForPostMessage'

describe('useListenForPostMessage hook', () => {
  const { Provider } = ConfigContext

  let fakeWindow
  let config

  function Wrapper(props) {
    return (
      <Provider value={config}>
        <MockListener {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    fakeWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      parent: {},
      location: {
        pathname: '/demo/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        search: '?origin=origin',
        hash: '',
      },
    }
    config = { isServer: false, isInIframe: true }
  })

  function MockListener({
    /* eslint-disable react/prop-types */
    type = 'listenFor',
    defaultValue = 'hi',
    validator = false,
    /* eslint-enable react/prop-types */
  }) {
    const value = useListenForPostMessage(fakeWindow, {
      type,
      defaultValue,
      validator,
    })
    return <div title="value">{value}</div>
  }

  function getListener() {
    return fakeWindow.addEventListener.mock.calls[0][1]
  }

  describe('does nothing in invalid contexts', () => {
    it.each([
      ['on server', () => (config.isServer = true)],
      ['in main window', () => (config.isInIframe = false)],
    ])('%s', (a, setConfig) => {
      expect.assertions(2)
      setConfig()

      let wrapper
      rtl.act(() => {
        wrapper = rtl.render(<Wrapper />)
      })

      expect(wrapper.getByTitle('value')).toHaveTextContent('hi')
      expect(fakeWindow.addEventListener).not.toHaveBeenCalled()
    })
  })
  describe('subscription', () => {
    it('subscribes on mount only', () => {
      expect.assertions(2)

      let wrapper
      rtl.act(() => {
        wrapper = rtl.render(<Wrapper />)
      })

      expect(fakeWindow.addEventListener).toHaveBeenCalledTimes(1)

      rtl.act(() => {
        wrapper.rerender()
      })

      expect(fakeWindow.addEventListener).toHaveBeenCalledTimes(1)
    })
  })
  it('unsubscribes on unmount', () => {
    expect.assertions(2)

    let wrapper
    rtl.act(() => {
      wrapper = rtl.render(<Wrapper />)
    })

    expect(fakeWindow.removeEventListener).not.toHaveBeenCalled()

    rtl.act(() => {
      wrapper.unmount()
    })

    expect(fakeWindow.addEventListener).toHaveBeenCalledTimes(1)
  })
  describe('postmessage event handling', () => {
    let event
    beforeEach(() => {
      event = {
        source: fakeWindow.parent,
        origin: 'origin',
        data: {
          type: 'listenFor',
          payload: 'got it!',
        },
      }
    })
    describe('invalid postmessage events', () => {
      it.each([
        [
          'source is not the parent window',
          () => (event.source = 'nope'),
          false,
        ],
        [
          'origin does not match expected origin',
          () => (event.origin = 'nope'),
          false,
        ],
        ['data is not set', () => (event.data = false), false],
        ['data has no type', () => (event.data.type = false), false],
        ['data type does not match', () => (event.data.type = 'nope'), false],
        [
          'data validator returns falsy',
          () => (event.data.type = 'nope'),
          () => false,
        ],
      ])('%s', (_, setup, validator) => {
        expect.assertions(1)
        setup()

        let wrapper
        rtl.act(() => {
          wrapper = rtl.render(<Wrapper validator={validator} />)
        })

        // this is the callback saveData, which was passed to addEventListener
        const listener = getListener()

        rtl.act(() => {
          listener(event)
        })

        expect(wrapper.getByTitle('value')).toHaveTextContent('hi')
      })
    })
    describe('valid postmessage events', () => {
      it('updates the value', () => {
        expect.assertions(1)

        let wrapper
        rtl.act(() => {
          wrapper = rtl.render(<Wrapper />)
        })

        // this is the callback saveData, which was passed to addEventListener
        const listener = getListener()

        rtl.act(() => {
          listener(event)
        })

        expect(wrapper.getByTitle('value')).toHaveTextContent('got it!')
      })
    })
  })
})
