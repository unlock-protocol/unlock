import {
  PostOfficeService,
  PostOfficeEvents,
} from '../../services/postOfficeService'
import { IframePostOfficeWindow } from '../../windowTypes'
import { PostMessages, ExtractPayload } from '../../messageTypes'
import { Locks } from '../../unlockTypes'

describe('postOfficeService', () => {
  let mockService: PostOfficeService
  let fakeWindow: IframePostOfficeWindow

  function expectPostMessage<T>(
    type: T,
    payload: ExtractPayload<T>,
    index = 1
  ) {
    expect(fakeWindow.parent.postMessage).toHaveBeenNthCalledWith(
      index,
      {
        type,
        payload,
      },
      'http://fun.times'
    )
  }

  function triggerListener<T>(type: T, payload: ExtractPayload<T>) {
    const first: any = fakeWindow.addEventListener
    const listener = first.mock.calls[0][1]

    fakeWindow.parent.postMessage = jest.fn()

    listener({
      source: fakeWindow.parent,
      origin: 'http://fun.times',
      data: {
        type,
        payload,
      },
    })
  }

  function expectListenerRespondsWith<T, U>(
    type: T,
    payload: ExtractPayload<T>,
    sendType: U,
    sendPayload: ExtractPayload<U>
  ) {
    triggerListener<T>(type, payload)

    expect(fakeWindow.parent.postMessage).toHaveBeenCalledWith(
      {
        type: sendType,
        payload: sendPayload,
      },
      'http://fun.times'
    )
  }

  function makeWindow() {
    fakeWindow = {
      parent: {
        postMessage: jest.fn(),
      },
      location: {
        href: 'http://example.com?origin=http%3a%2f%2ffun.times',
      },
      addEventListener: jest.fn(),
    }
  }

  describe('constructor', () => {
    beforeEach(() => {
      makeWindow()
    })

    it('should send PostMessages.READY to the main window', () => {
      expect.assertions(1)

      mockService = new PostOfficeService(fakeWindow, 2)

      expectPostMessage<PostMessages.READY>(PostMessages.READY, undefined)
    })

    it('should add a handler for PostMessages.SEND_UPDATES', () => {
      expect.assertions(1)

      mockService = new PostOfficeService(fakeWindow, 2)

      expectListenerRespondsWith<
        PostMessages.SEND_UPDATES,
        PostMessages.UPDATE_ACCOUNT
      >(PostMessages.SEND_UPDATES, 'account', PostMessages.UPDATE_ACCOUNT, null)
    })

    it('should add a handler for PostMessages.UPDATE_LOCKS', done => {
      expect.assertions(1)
      const lockAddress1 = '0x1234567890123456789012345678901234567890'
      const lockAddress2 = '0xa234567890123456789012345678901234567890'
      const fakeLocks: Locks = {
        [lockAddress1]: {
          address: lockAddress1,
          name: 'hi',
          keyPrice: '1',
          expirationDuration: 123,
          currencyContractAddress: null,
          key: {
            status: 'none',
            expiration: 0,
            transactions: [],
            confirmations: 0,
            owner: lockAddress1,
            lock: lockAddress1,
          },
        },
        [lockAddress2]: {
          address: lockAddress2,
          name: 'hi',
          keyPrice: '1',
          expirationDuration: 123,
          currencyContractAddress: null,
          key: {
            status: 'none',
            expiration: 0,
            transactions: [],
            confirmations: 0,
            owner: lockAddress1,
            lock: lockAddress1,
          },
        },
      }

      mockService = new PostOfficeService(fakeWindow, 2)

      mockService.on(PostOfficeEvents.LockUpdate, locks => {
        expect(locks).toEqual(fakeLocks)
        done()
      })

      triggerListener<PostMessages.UPDATE_LOCKS>(
        PostMessages.UPDATE_LOCKS,
        fakeLocks
      )
    })

    it('should error if invalid locks are passed to PostMessages.UPDATE_LOCKS', done => {
      expect.assertions(1)
      const lockAddress1 = '0x1234567890123456789012345678901234567890'
      const lockAddress2 = '0xa234567890123456789012345678901234567890'
      const fakeLocks = {
        [lockAddress1]: {
          address: lockAddress1,
          keyPrice: '1',
          expirationDuration: 123,
          currencyContractAddress: null,
          key: {
            status: 'none',
            expiration: 0,
            transactions: [],
            confirmations: 0,
            owner: lockAddress1,
            lock: lockAddress1,
          },
        },
        [lockAddress2]: {
          address: lockAddress2,
          name: 'hi',
          keyPrice: '1',
          currencyContractAddress: null,
          key: {
            status: 'none',
            expiration: 0,
            transactions: [],
            confirmations: 0,
            owner: lockAddress1,
            lock: lockAddress1,
          },
        },
      }

      mockService = new PostOfficeService(fakeWindow, 2)

      mockService.on(PostOfficeEvents.Error, message => {
        expect(message).toBe('invalid locks')
        done()
      })

      triggerListener<PostMessages.UPDATE_LOCKS>(
        PostMessages.UPDATE_LOCKS,
        (fakeLocks as unknown) as Locks // override types to test invalid case
      )
    })

    it('should add a handler for PostMessages.PURCHASE_KEY', () => {
      expect.assertions(2)

      const lockAddress = '0x1234567890123456789012345678901234567890'

      mockService = new PostOfficeService(fakeWindow, 2)

      mockService.on(PostOfficeEvents.KeyPurchase, (lock, extraTip) => {
        expect(lock).toBe(lockAddress)
        expect(extraTip).toBe('0')
      })

      triggerListener<PostMessages.PURCHASE_KEY>(PostMessages.PURCHASE_KEY, {
        lock: lockAddress,
        extraTip: '0',
      })
    })

    it('should error if an invalid lock address is passed to PostMessages.PURCHASE_KEY', () => {
      expect.assertions(1)

      const lockAddress = '0x1234567890126789012345678901234567890'

      mockService = new PostOfficeService(fakeWindow, 2)

      mockService.on(PostOfficeEvents.Error, error => {
        expect(error).toBe('invalid lock, cannot purchase a key')
      })

      triggerListener<PostMessages.PURCHASE_KEY>(PostMessages.PURCHASE_KEY, {
        lock: lockAddress,
        extraTip: '0',
      })
    })
  })

  describe('setAccount', () => {
    beforeEach(() => {
      makeWindow()
      mockService = new PostOfficeService(fakeWindow, 2)
      fakeWindow.parent.postMessage = jest.fn() // reset
    })

    it('should post the account to the main window', () => {
      expect.assertions(1)

      mockService.setAccount('hi')

      expectPostMessage<PostMessages.UPDATE_ACCOUNT>(
        PostMessages.UPDATE_ACCOUNT,
        'hi'
      )
    })

    it('should trigger show of the accounts modal if the user is not logged in', () => {
      expect.assertions(1)

      mockService.setAccount(null)

      expectPostMessage<PostMessages.SHOW_ACCOUNTS_MODAL>(
        PostMessages.SHOW_ACCOUNTS_MODAL,
        undefined,
        2 /* which call to postMessage */
      )
    })
  })

  describe('other methods', () => {
    beforeEach(() => {
      makeWindow()
      mockService = new PostOfficeService(fakeWindow, 2)
    })

    it('should send a request to show the accounts modal when showAccountModal is called', () => {
      expect.assertions(1)

      mockService.showAccountModal()

      expectPostMessage<PostMessages.SHOW_ACCOUNTS_MODAL>(
        PostMessages.SHOW_ACCOUNTS_MODAL,
        undefined,
        2
      )
    })

    it('should send a request to hide the accounts modal when hideAccountModal is called', () => {
      expect.assertions(1)

      mockService.hideAccountModal()

      expectPostMessage<PostMessages.HIDE_ACCOUNTS_MODAL>(
        PostMessages.HIDE_ACCOUNTS_MODAL,
        undefined,
        2
      )
    })

    it('should send a key purchase transaction initiated when transactionInitiated is called', () => {
      expect.assertions(1)

      mockService.transactionInitiated()

      expectPostMessage<PostMessages.INITIATED_TRANSACTION>(
        PostMessages.INITIATED_TRANSACTION,
        undefined,
        2
      )
    })
  })
})
