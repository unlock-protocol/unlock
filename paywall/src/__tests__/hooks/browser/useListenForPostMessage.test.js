import * as rtl from 'react-testing-library'
import React from 'react'
import PropTypes from 'prop-types'

import { ConfigContext } from '../../../utils/withConfig'
import useListenForPostMessage from '../../../hooks/browser/useListenForPostMessage'
import { WindowContext } from '../../../hooks/browser/useWindow'

describe('useListenForPostMessage hook', () => {
  const { Provider } = ConfigContext

  let fakeWindow
  let config
  let called = jest.fn()

  function Wrapper(props) {
    return (
      <Provider value={config}>
        <WindowContext.Provider value={fakeWindow}>
          <MockListener {...props} />
        </WindowContext.Provider>
      </Provider>
    )
  }

  beforeEach(() => {
    fakeWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      parent: {},
      location: {
        pathname: '/page/0x79b8825a3e7Fb15263D0DD455B8aAfc08503bb54',
        search: '?origin=origin',
        hash: '',
      },
    }
    config = { isServer: false, isInIframe: true }
  })

  function MockListener({ type, defaultValue, validator, getValue }) {
    const value = useListenForPostMessage({
      type,
      defaultValue,
      validator,
      getValue,
    })
    called()
    return <div title="value">{JSON.stringify(value)}</div>
  }

  MockListener.propTypes = {
    type: PropTypes.string,
    defaultValue: PropTypes.string,
    validator: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    getValue: PropTypes.func,
  }

  MockListener.defaultProps = {
    type: 'listenFor',
    defaultValue: 'hi',
    validator: false,
    getValue: (value, defaults) => value || defaults,
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
          payload: { thing: 'got it!' },
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

      it('calls the getValue helper to merge the value with its defaults', () => {
        expect.assertions(1)

        let wrapper
        rtl.act(() => {
          wrapper = rtl.render(
            <Wrapper
              defaultValue="boo"
              getValue={(v, d) => JSON.stringify(v) + d}
            />
          )
        })

        // this is the callback saveData, which was passed to addEventListener
        const listener = getListener()

        rtl.act(() => {
          listener(event)
        })

        expect(wrapper.getByTitle('value')).toHaveTextContent(
          '"{\\"thing\\":\\"got it!\\"}boo"'
        )
      })

      it('updates the value only once if it does not change', () => {
        expect.assertions(4)
        called = jest.fn()
        let listener

        const listeners = {
          message: new Map(),
        }

        fakeWindow.addEventListener = (event, cb) => {
          listener = cb
          listeners.message.set(cb, cb)
        }
        fakeWindow.removeEventListener = (event, cb) => {
          listeners.message.delete(cb)
        }

        let wrapper

        // the rtl.act calls are wrappers so that the async nature of re-rendering is
        // made synchronous so we can test the effects of the hooks
        // we wrap each call in a separate act so that we can test
        // in between the calls, as if the browser had sent several
        // postMessage events with the same object, but it looks
        // different once it arrives
        rtl.act(() => {
          wrapper = rtl.render(<Wrapper defaultValue="hi" />)
        })
        expect(wrapper.getByTitle('value')).toHaveTextContent('hi')

        rtl.act(() => {
          listener(event)
        })
        expect(wrapper.getByTitle('value')).toHaveTextContent('got it!')
        event.data.payload = { ...event.data.payload }

        rtl.act(() => {
          listener(event)
        })
        event.data.payload = { ...event.data.payload }

        rtl.act(() => {
          listener(event)
        })
        event.data.payload = { ...event.data.payload }

        rtl.act(() => {
          listener(event)
        })

        expect(wrapper.getByTitle('value')).toHaveTextContent('got it!')
        expect(called).toHaveBeenCalledTimes(2)
      })
    })
  })
})
