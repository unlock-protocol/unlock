import * as blockerManager from '../../../paywall-builder/blocker'

describe('paywall builder', () => {
  describe('blocker', () => {
    it('getBlocker', () => {
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

      expect(blocker.appendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          innerText: 'Loading access rights...',
        })
      )
    })

    it('addBlocker', () => {
      const document = {
        body: {
          appendChild: jest.fn(),
        },
      }

      blockerManager.addBlocker(document, 'blocker')

      expect(document.body.appendChild).toHaveBeenCalledWith('blocker')
    })

    it('removeBlocker', () => {
      const blocker = {
        remove: jest.fn(),
      }

      blockerManager.removeBlocker(blocker)

      expect(blocker.remove).toHaveBeenCalled()
    })
  })
})
