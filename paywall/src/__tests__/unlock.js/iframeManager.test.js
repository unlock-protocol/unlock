import {
  makeIframe,
  addIframeToDocument,
  showIframe,
  hideIframe,
} from '../../unlock.js/iframeManager'

describe('iframeManager', () => {
  jest.useFakeTimers()

  it('creates an iframe element', () => {
    expect.assertions(3)

    const iframe = makeIframe(window, 'http://example.com')

    expect(iframe).toBeInstanceOf(Element)
    expect(iframe.src).toBe('http://example.com/')
    expect(iframe.className).toBe('unlock start')
  })

  it('adds the iframe to the document every 500 ms', () => {
    expect.assertions(3)
    // unfortunately, this function does not exist in js-dom
    window.document.body.insertAdjacentElement = jest.fn()

    const iframe = makeIframe(window, 'http://example.com')

    addIframeToDocument(window, iframe)

    expect(window.document.body.insertAdjacentElement).toHaveBeenCalledWith(
      'afterbegin',
      iframe
    )
    expect(window.document.body.insertAdjacentElement).toHaveBeenCalledTimes(1)
    jest.runOnlyPendingTimers()
    expect(window.document.body.insertAdjacentElement).toHaveBeenCalledTimes(2)
  })

  it('shows the iframe and stops scroll on body when calling showIframe', () => {
    expect.assertions(2)
    const iframe = makeIframe(window, 'http://example.com')

    showIframe(window, iframe)

    expect(window.document.body.style.overflow).toBe('hidden')
    expect(iframe.className).toBe('unlock start show')
  })

  it('hides the iframe and restores scroll on calling hideIframe', () => {
    expect.assertions(2)
    const iframe = makeIframe(window, 'http://example.com')

    hideIframe(window, iframe)

    expect(window.document.body.style.overflow).toBe('')
    expect(iframe.className).toBe('unlock start')
  })
})
