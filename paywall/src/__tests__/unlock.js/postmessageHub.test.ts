import {
  setupDataListeners,
  setupCheckoutListeners,
  setupAccountsListeners,
} from '../../unlock.js/postMessageHub'
import { PostMessages } from '../../messageTypes'
import FakeWindow from '../test-helpers/fakeWindowHelpers'
import IframeHandler from '../../unlock.js/IframeHandler'

describe('postMessageHub', () => {
  describe('data iframe', () => {
    const init = (overrides: any = {}) => {
      const window = new FakeWindow()
      const iframes = new IframeHandler(
        window,
        'http://d',
        'http://c',
        'http://a'
      )
      ;(iframes.checkout as any).postMessage = jest.fn()
      ;(iframes.data as any).postMessage = jest.fn()
      iframes.accounts.postMessage = jest.fn()

      setupDataListeners({
        iframes,
        blockchainData: overrides.blockchainData || {},
        erc20ContractAddress: overrides.erc20ContractAddress || '',
        usingManagedAccount: overrides.usingManagedAccount || false,
        toggleLockState: overrides.toggleLockState || jest.fn(),
        paywallConfig: overrides.paywallConfig || {},
      })

      return {
        window,
        iframes,
      }
    }
    describe('UPDATE_*', () => {
      it.each([
        [PostMessages.UPDATE_LOCKS, 'locks'],
        [PostMessages.UPDATE_ACCOUNT, 'account'],
        [PostMessages.UPDATE_NETWORK, 'network'],
        [PostMessages.UPDATE_KEYS, 'keys'],
        [PostMessages.UPDATE_TRANSACTIONS, 'transactions'],
      ])(
        'when data iframe emits %p, it sends payload to checkout, accounts, and main window',
        (message, payload) => {
          expect.assertions(3)

          let blockchainData: { [key: string]: any } = {}
          const { iframes } = init({ blockchainData })

          iframes.data.emit(message as any, payload)

          expect(iframes.checkout.postMessage).toHaveBeenCalledWith(
            message,
            payload
          )
          expect(iframes.accounts.postMessage).toHaveBeenCalledWith(
            message,
            payload
          )
          expect(blockchainData[payload]).toEqual(payload)
        }
      )
    })

    describe('UPDATE_ACCOUNT_BALANCE', () => {
      it('should pass balance along when not using managed account', () => {
        expect.assertions(2)

        const blockchainData: any = {}
        const { iframes } = init({ blockchainData })

        const payload = {
          eth: '7',
          '0xneato': '8',
        }

        iframes.data.emit(PostMessages.UPDATE_ACCOUNT_BALANCE, payload)

        expect(iframes.checkout.postMessage).toHaveBeenCalledWith(
          PostMessages.UPDATE_ACCOUNT_BALANCE,
          payload
        )
        expect(blockchainData.balance).toEqual(payload)
      })

      it('should intercept a certain erc20 address and zero out all other balances', () => {
        expect.assertions(2)

        const blockchainData: any = {}
        const usingManagedAccount = true
        const erc20ContractAddress = '0xneato'
        const { iframes } = init({
          blockchainData,
          usingManagedAccount,
          erc20ContractAddress,
        })

        const payload = {
          eth: '7',
          '0xneato': '8',
        }

        const expectedPayload = {
          eth: '0',
          '0xneato': '35',
        }

        iframes.data.emit(PostMessages.UPDATE_ACCOUNT_BALANCE, payload)

        expect(iframes.checkout.postMessage).toHaveBeenCalledWith(
          PostMessages.UPDATE_ACCOUNT_BALANCE,
          expectedPayload
        )
        expect(blockchainData.balance).toEqual(expectedPayload)
      })
    })

    describe('ERROR', () => {
      it('should send all errors to checkout iframe', () => {
        expect.assertions(2)

        const toggleLockState = jest.fn()
        const { iframes } = init({ toggleLockState })
        const error = 'angry bees in the datacenter'
        iframes.data.emit(PostMessages.ERROR, error)

        expect(iframes.checkout.postMessage).toHaveBeenCalledWith(
          PostMessages.ERROR,
          error
        )
        expect(toggleLockState).not.toHaveBeenCalled()
      })

      it('should lock the page only on the no wallet error', () => {
        expect.assertions(2)

        const toggleLockState = jest.fn()
        const { iframes } = init({ toggleLockState })
        const error = 'no ethereum wallet is available'
        iframes.data.emit(PostMessages.ERROR, error)

        expect(iframes.checkout.postMessage).toHaveBeenCalledWith(
          PostMessages.ERROR,
          error
        )
        expect(toggleLockState).toHaveBeenCalledWith(PostMessages.LOCKED)
      })
    })

    describe('LOCKED', () => {
      it('should send LOCKED to checkout and toggleLockState', () => {
        expect.assertions(2)

        const toggleLockState = jest.fn()
        const { iframes } = init({ toggleLockState })

        iframes.data.emit(PostMessages.LOCKED)

        expect(iframes.checkout.postMessage).toHaveBeenCalledWith(
          PostMessages.LOCKED,
          undefined
        )
        expect(toggleLockState).toHaveBeenCalledWith(PostMessages.LOCKED)
      })
    })

    describe('UNLOCKED', () => {
      it('should send UNLOCKED to checkout and toggleLockState', () => {
        expect.assertions(2)

        const toggleLockState = jest.fn()
        const { iframes } = init({ toggleLockState })

        iframes.data.emit(PostMessages.UNLOCKED, [])

        expect(iframes.checkout.postMessage).toHaveBeenCalledWith(
          PostMessages.UNLOCKED,
          []
        )
        expect(toggleLockState).toHaveBeenCalledWith(PostMessages.UNLOCKED)
      })
    })

    describe('READY', () => {
      it('should send the paywall config down to data iframe', () => {
        expect.assertions(1)

        const paywallConfig = {
          locks: 'several',
        }

        const { iframes } = init({ paywallConfig })

        iframes.data.emit(PostMessages.READY)

        expect(iframes.data.postMessage).toHaveBeenCalledWith(
          PostMessages.CONFIG,
          paywallConfig
        )
      })
    })
  })

  describe('accounts iframe', () => {
    const init = (overrides: any = {}) => {
      const window = new FakeWindow()
      const iframes = new IframeHandler(
        window,
        'http://d',
        'http://c',
        'http://a'
      )
      ;(iframes.checkout as any).postMessage = jest.fn()
      ;(iframes.data as any).postMessage = jest.fn()
      iframes.accounts.postMessage = jest.fn()

      setupAccountsListeners({
        iframes,
        paywallConfig: overrides.paywallConfig || {},
        showAccountIframe: overrides.showAccountIframe || jest.fn(),
        hideAccountIframe: overrides.hideAccountIframe || jest.fn(),
        setUserAccountAddress: overrides.setUserAccountAddress || jest.fn(),
        setUserAccountNetwork: overrides.setUserAccountNetwork || jest.fn(),
      })

      return {
        window,
        iframes,
      }
    }
    describe('READY', () => {
      it('should send the config and requests for network and account down to account iframe', () => {
        expect.assertions(4)

        const {
          iframes: { accounts, data },
        } = init()

        accounts.emit(PostMessages.READY)

        expect(accounts.postMessage).toHaveBeenNthCalledWith(
          1,
          PostMessages.CONFIG,
          {}
        )
        expect(accounts.postMessage).toHaveBeenNthCalledWith(
          2,
          PostMessages.SEND_UPDATES,
          'account'
        )
        expect(accounts.postMessage).toHaveBeenNthCalledWith(
          3,
          PostMessages.SEND_UPDATES,
          'network'
        )

        // also we get locks from data iframe (obsolete with main window mirror?)
        expect(data.postMessage).toHaveBeenCalledWith(
          PostMessages.SEND_UPDATES,
          'locks'
        )
      })
    })

    describe('*_ACCOUNTS_MODAL', () => {
      it('calls the showAccountIframe function on SHOW_ACCOUNTS_MODAL', () => {
        expect.assertions(1)

        const showAccountIframe = jest.fn()
        const {
          iframes: { accounts },
        } = init({ showAccountIframe })

        accounts.emit(PostMessages.SHOW_ACCOUNTS_MODAL)

        expect(showAccountIframe).toHaveBeenCalled()
      })

      it('calls the hideAccountIframe function on HIDE_ACCOUNTS_MODAL', () => {
        expect.assertions(1)

        const hideAccountIframe = jest.fn()
        const {
          iframes: { accounts },
        } = init({ hideAccountIframe })

        accounts.emit(PostMessages.HIDE_ACCOUNTS_MODAL)

        expect(hideAccountIframe).toHaveBeenCalled()
      })
    })

    describe('UPDATE_*', () => {
      it('should call the setUserAccountAddress function on UPDATE_ACCOUNT', () => {
        expect.assertions(1)

        const setUserAccountAddress = jest.fn()
        const {
          iframes: { accounts },
        } = init({ setUserAccountAddress })
        accounts.emit(PostMessages.UPDATE_ACCOUNT, '0xbudgerigar')
        expect(setUserAccountAddress).toHaveBeenCalledWith('0xbudgerigar')
      })

      it('should call the setUserAccountNetwork function on UPDATE_NETWORK', () => {
        expect.assertions(1)

        const setUserAccountNetwork = jest.fn()
        const {
          iframes: { accounts },
        } = init({ setUserAccountNetwork })
        accounts.emit(PostMessages.UPDATE_NETWORK, 1)
        expect(setUserAccountNetwork).toHaveBeenCalledWith(1)
      })
    })

    it('should pass INITIATED_TRANSACTION to data iframe', () => {
      expect.assertions(1)

      const {
        iframes: { accounts, data },
      } = init()

      accounts.emit(PostMessages.INITIATED_TRANSACTION)
      expect(data.postMessage).toHaveBeenLastCalledWith(
        PostMessages.INITIATED_TRANSACTION,
        undefined
      )
    })
  })

  describe('checkout iframe', () => {
    const init = (overrides: any = {}) => {
      const window = new FakeWindow()
      const iframes = new IframeHandler(
        window,
        'http://d',
        'http://c',
        'http://a'
      )
      ;(iframes.checkout as any).postMessage = jest.fn()
      ;(iframes.data as any).postMessage = jest.fn()
      iframes.accounts.postMessage = jest.fn()

      setupCheckoutListeners({
        iframes,
        paywallConfig: overrides.paywallConfig || {},
        hideCheckoutIframe: overrides.hideCheckoutIframe || jest.fn(),
        usingManagedAccount: overrides.usingManagedAccount || false,
      })

      return {
        window,
        iframes,
      }
    }

    it('should get all the data from data iframe on READY', () => {
      expect.assertions(1)

      const { iframes } = init()

      iframes.checkout.emit(PostMessages.READY)

      expect(iframes.data.postMessage).toHaveBeenCalledTimes(6)
    })

    it('should call the hideCheckoutIframe function on DISMISS_CHECKOUT', () => {
      expect.assertions(1)

      const hideCheckoutIframe = jest.fn()
      const { iframes } = init({ hideCheckoutIframe })

      iframes.checkout.emit(PostMessages.DISMISS_CHECKOUT)
      expect(hideCheckoutIframe).toHaveBeenCalled()
    })

    describe('PURCHASE_KEY', () => {
      it('should forward the request to the accounts iframe if usingManagedAccount', () => {
        expect.assertions(2)

        const usingManagedAccount = true
        const {
          iframes: { accounts, data, checkout },
        } = init({ usingManagedAccount })

        const request = {
          lock: '0xneato',
          extraTip: '0',
        }

        checkout.emit(PostMessages.PURCHASE_KEY, request)
        expect(accounts.postMessage).toHaveBeenCalledWith(
          PostMessages.PURCHASE_KEY,
          request
        )
        expect(data.postMessage).not.toHaveBeenCalled()
      })
    })
  })
})
