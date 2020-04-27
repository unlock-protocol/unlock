import {
  dispatchEvent,
  setupUnlockProtocolVariable,
  unlockEvents,
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
      dispatchEvent('neato', 'ditto')

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
      dispatchEvent('neato', 'ditto')

      expect((global as any).dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          initCustomEvent: expect.any(Function),
        })
      )
    })

    it('should emit the legacy unlockProtocol event when unlockProtocol.status', () => {
      expect.assertions(3)
      const state = 'locked'

      const CustomEvent = jest.fn((name, opts) => {
        return { name, opts }
      })
      const windowDispatchEvent = jest.fn()
      ;(global as any).CustomEvent = CustomEvent
      ;(global as any).dispatchEvent = windowDispatchEvent

      dispatchEvent(unlockEvents.status, {
        state,
      })

      expect((global as any).dispatchEvent).toHaveBeenCalledTimes(2)
      expect((global as any).dispatchEvent).toHaveBeenNthCalledWith(1, {
        name: 'unlockProtocol',
        opts: { detail: state },
      })
      expect((global as any).dispatchEvent).toHaveBeenNthCalledWith(2, {
        name: 'unlockProtocol.status',
        opts: { detail: { state } },
      })
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

  describe('unlockEvents', () => {
    it('should define the right events', () => {
      expect.assertions(1)
      expect(unlockEvents).toEqual({
        authenticated: 'unlockProtocol.authenticated',
        status: 'unlockProtocol.status',
        transactionSent: 'unlockProtocol.transactionSent',
      })
    })
  })
})
