import { getIframe, add, show, hide } from '../../paywall-builder/iframe'

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

    expect(el.setAttribute).toHaveBeenCalledTimes(2)

    expect(el.className).toBe('unlock start')
    expect(el.setAttribute).toHaveBeenNthCalledWith(1, 'src', 'hi')
    expect(el.setAttribute).toHaveBeenNthCalledWith(2, 'data-unlock', 'yes')
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
    const iframe = {}
    const document = {
      body: {
        style: {},
      },
    }

    show(iframe, document)
    expect(iframe.className).toBe('unlock start show')

    expect(document.body.style).toEqual({
      overflow: 'hidden',
    })
  })

  describe('hide', () => {
    it('unlocked', () => {
      expect.assertions(2)

      jest.useFakeTimers()
      const iframe = {}
      const document = {
        body: {
          style: { overflow: 'hidden' },
        },
      }
      hide(iframe, document)

      expect(iframe.className).toBe('unlock start show hide')
      expect(document.body.style).toEqual({
        overflow: '',
      })
    })

    it('optimistic unlocking', () => {
      expect.assertions(2)

      jest.useFakeTimers()
      const iframe = {}
      const document = {
        body: {
          style: { overflow: 'hidden' },
        },
      }
      hide(iframe, document, false)

      expect(iframe.className).toBe('unlock start show hide optimism')
      expect(document.body.style).toEqual({
        overflow: '',
      })
    })
  })
})
