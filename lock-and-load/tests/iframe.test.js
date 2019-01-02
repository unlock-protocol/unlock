import { getIframe, iframeStyles, add, show, hide } from "../src/iframe";

describe('iframe', () => {
  it('add appends the iframe to document.body', () => {
    const el = {
      setAttribute: jest.fn()
    }
    const document = {
      createElement() {
        return el
      }
    }

    expect(getIframe(document, 'hi')).toBe(el)

    expect(el.setAttribute).toHaveBeenCalledTimes(2)
    expect(el.setAttribute).toHaveBeenLastCalledWith('src', 'hi')
    expect(el.setAttribute).toHaveBeenNthCalledWith(1, 'style', iframeStyles.join(' '))
  })

  it('add', () => {
    const document = {
      body: {
        appendChild: jest.fn()
      }
    }
    add(document, 'hi')

    expect(document.body.appendChild).toHaveBeenCalledWith('hi')
  })

  it('show', () => {
    const iframe = {
      style: {}
    }

    show(iframe)
    expect(iframe.style).toEqual({
      display: 'block',
      'z-index': '2147483647'
    })
  })

  it('hide', () => {
    const document = {
      body: {
        removeChild: jest.fn()
      }
    }
    hide(document, 'hi')

    expect(document.body.removeChild).toHaveBeenCalledWith('hi')
  })
})