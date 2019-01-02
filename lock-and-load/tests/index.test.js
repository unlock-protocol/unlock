import lockAndLoad from '../src'
import mockdoc from './mockdoc'

describe('lockAndLoad', () => {
  let listenChildren
  let listenIframe
  let listenScripts
  let listenQuery
  let iframe
  let document

  beforeEach(() => {
    listenChildren = jest.fn()
    listenIframe = jest.fn()
    listenScripts = jest.fn()
    listenQuery = jest.fn()
    document = mockdoc(['first', 'second/static/paywall.js'], 'lock', listenScripts, listenQuery, listenChildren, listenIframe, ifr => iframe = ifr)
  })
  describe('sets up the iframe on load', () => {
    it('explicit unlock_url', () => {
      const window = {
        unlock_url: 'unlock/it',
        addEventListener(type, listener) {
          expect(type).toBe('message')
          expect(listener).not.toBe(null)
        }
      }
      lockAndLoad(window, document)

      // we don't look for the unlock url if passed explicitly
      expect(listenScripts).not.toHaveBeenCalled()
      expect(listenQuery).toHaveBeenCalled()
      expect(listenIframe).toHaveBeenCalled()
      expect(listenChildren).toHaveBeenCalledWith(iframe, 'append')
    })

    it('implied unlock_url', () => {
      const window = {
        addEventListener(type, listener) {
          expect(type).toBe('message')
          expect(listener).not.toBe(null)
        }
      }
      lockAndLoad(window, document)

      // we do look for the unlock url if not passed
      expect(listenScripts).toHaveBeenCalled()
      expect(listenQuery).toHaveBeenCalled()
      expect(listenIframe).toHaveBeenCalled()
      expect(listenChildren).toHaveBeenCalledWith(iframe, 'append')
    })

    it('no locks present', () => {
      document = mockdoc(['first', 'second'], false, listenScripts, listenQuery, listenChildren, listenIframe)
      const window = {
        addEventListener(type, listener) {
          expect(type).toBe('message')
          expect(listener).not.toBe(null)
        }
      }
      lockAndLoad(window, document)

      expect(listenScripts).toHaveBeenCalled()
      expect(listenQuery).toHaveBeenCalled()

      // we exit early if no locks are found
      expect(listenIframe).not.toHaveBeenCalled()
      expect(listenChildren).not.toHaveBeenCalled()
    })
  })

  it('event listeners', () => {
    let listener
    const window = {
      addEventListener(type, l) {
        listener = l
      }
    }
    lockAndLoad(window, document)

    listener({ data: 'locked' })

    // this next line proves that "show" was called
    expect(Object.keys(iframe.style)).toEqual(['display', 'z-index'])

    listener({ data: 'locked' })
    expect(listenChildren).toHaveBeenCalledTimes(1)

    listener({ data: 'unlocked' })
    expect(listenChildren).toHaveBeenCalledTimes(2)
    expect(listenChildren).toHaveBeenNthCalledWith(2, iframe, 'remove')
  })
})