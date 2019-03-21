import * as blockerManager from '../../paywall-builder/blocker'

jest.mock('../../paywall-builder/script', () => {
  return {
    findPaywallUrl: () => 'https://foo',
  }
})

describe('paywall builder', () => {
  describe('blocker', () => {
    it('getBlocker', () => {
      expect.assertions(2)
      const document = {
        createElement() {
          return { style: {}, appendChild: jest.fn() }
        },
      }

      const blocker = blockerManager.getBlocker(document)

      expect(blocker).toEqual(
        expect.objectContaining({
          id: '_unlock_blocker',
          style: {
            alignItems: 'center',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            fontSize: '30px',
            height: '100vh',
            justifyContent: 'center',
            left: 0,
            position: 'fixed',
            top: 0,
            width: '100vw',
            zIndex: 222222222222222,
          },
        })
      )

      expect(blocker.appendChild).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          src: 'https://foo/static/images/loading.svg',
          style: {
            height: '80px',
            width: '80px',
            border: 'none',
          },
        })
      )
    })

    it('addBlocker', () => {
      expect.assertions(1)
      const document = {
        body: {
          appendChild: jest.fn(),
        },
      }

      blockerManager.addBlocker(document, 'blocker')

      expect(document.body.appendChild).toHaveBeenCalledWith('blocker')
    })

    it('removeBlocker', () => {
      expect.assertions(1)
      const blocker = {
        remove: jest.fn(),
      }

      blockerManager.removeBlocker(blocker)

      expect(blocker.remove).toHaveBeenCalled()
    })
  })
})
