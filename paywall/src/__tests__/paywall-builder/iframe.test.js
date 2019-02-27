import {
  getIframe,
  iframeStyles,
  add,
  show,
  hide,
} from '../../../paywall-builder/iframe'

describe('iframe', () => {
  it('add appends the iframe to document.body', () => {
    expect.assertions(5)
    const el = {
      setAttribute: jest.fn(),
    }
    const document = {
      createElement() {
        return el
      },
    }

    expect(getIframe(document, 'hi')).toBe(el)

    expect(el.setAttribute).toHaveBeenCalledTimes(3)

    expect(el.setAttribute).toHaveBeenNthCalledWith(
      1,
      'style',
      iframeStyles.join('; ')
    )
    expect(el.setAttribute).toHaveBeenNthCalledWith(2, 'src', 'hi')
    expect(el.setAttribute).toHaveBeenNthCalledWith(3, 'data-unlock', 'yes')
  })

  describe('add', () => {
    it('adds iframe if not present', () => {
      expect.assertions(1)
      const document = {
        body: {
          insertAdjacentElement: jest.fn(),
          style: {},
        },
        querySelector() {
          return false
        },
      }
      add(document, 'hi')

      expect(document.body.insertAdjacentElement).toHaveBeenCalledWith(
        'afterbegin',
        'hi'
      )
    })
    it('ignores add if present', () => {
      expect.assertions(1)
      const document = {
        body: {
          appendChild: jest.fn(),
        },
        querySelector() {
          return true
        },
      }
      add(document, 'hi')

      expect(document.body.appendChild).not.toHaveBeenCalled()
    })
  })

  it('show', () => {
    expect.assertions(2)
    const iframe = {
      style: {},
    }
    const document = {
      body: {
        style: {},
      },
    }

    show(iframe, document)
    expect(iframe.style).toEqual({
      display: 'block',
      'z-index': '2147483647',
    })

    expect(document.body.style).toEqual({
      overflow: 'hidden',
    })
  })

  it('hide', () => {
    expect.assertions(2)
    const iframe = {
      style: {},
      contentDocument: {
        body: {
          style: {},
        },
      },
      addEventListener: () => {},
    }
    const document = {
      body: {
        style: { overflow: 'hidden' },
      },
    }
    hide(iframe, document)

    expect(iframe.style).toEqual({
      backgroundColor: 'transparent',
      backgroundImage: 'none',
      overflow: 'hidden',
      width: '134px',
      height: '160px',
      'margin-right': '-104px',
      left: null,
      top: null,
      right: '0',
      bottom: '105px',
      transition: 'margin-right 0.4s ease-in',
    })

    expect(document.body.style).toEqual({
      overflow: '',
    })
  })
})
