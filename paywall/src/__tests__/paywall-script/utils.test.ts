import {
  dispatchEvent,
  setupUnlockProtocolVariable,
} from '../../paywall-script/utils'

describe('Paywall script utils', () => {
  describe('dispatchEvent', () => {
    it('calls window.dispatchEvent with a CustomEvent when supported', () => {
      expect.assertions(1)

      // awkward implementation because it needs to be "newable"
      const CustomEvent = jest.fn(function() {
        return { event: 'custom' }
      })
      const windowDispatchEvent = jest.fn()
      ;(global as any).CustomEvent = CustomEvent
      ;(global as any).dispatchEvent = windowDispatchEvent
      dispatchEvent('neato')

      expect((global as any).dispatchEvent).toHaveBeenCalledWith({
        event: 'custom',
      })
    })

    it('calls window.dispatchEvent with a document.createEvent when falling back', () => {
      expect.assertions(1)

      const createEvent = jest.fn(() => ({
        initCustomEvent: jest.fn(),
      }))
      const windowDispatchEvent = jest.fn()

        // Need to delete this from the last test
      ;(global as any).CustomEvent = undefined
      ;(global as any).document.createEvent = createEvent
      ;(global as any).dispatchEvent = windowDispatchEvent
      dispatchEvent('neato')

      expect((global as any).dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          initCustomEvent: expect.any(Function),
        })
      )
    })
  })

  describe('setupUnlockProtocolVariable', () => {
    it('sets up a global variable containing the immutable properties passed in', () => {
      expect.assertions(2)

      const loadCheckoutModal = () => 'checkout'
      const readANewspaper = () => 'reading...'
      const thisIsANumber = 7

      expect((global as any).unlockProtocol).not.toBeDefined()

      setupUnlockProtocolVariable({
        loadCheckoutModal,
        readANewspaper,
        thisIsANumber,
      })

      expect((global as any).unlockProtocol).toBeDefined()
    })
  })
})
