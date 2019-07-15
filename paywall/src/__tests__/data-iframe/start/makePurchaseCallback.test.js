import makePurchaseCallback from '../../../data-iframe/start/makePurchaseCallback'
import {
  setLocks,
  setKeys,
  setAccount,
  setNetwork,
} from '../../../data-iframe/cacheHandler'
import { setAccount as setBlockchainAccount } from '../../../data-iframe/blockchainHandler/account'

describe('makePurchaseCallback', () => {
  let walletService
  let web3Service
  const requiredConfirmations = 2
  let update
  let fakeWindow

  it('should return a function that can be used to purchase a key', () => {
    expect.assertions(1)

    const purchase = makePurchaseCallback({
      walletService,
      web3Service,
      requiredConfirmations,
      update,
      window: fakeWindow,
    })

    expect(purchase).toBeInstanceOf(Function)
  })

  describe('purchase callback', () => {
    let purchase

    beforeEach(async () => {
      fakeWindow = {
        storage: {},
        localStorage: {
          clear: () => (fakeWindow.storage = {}),
          setItem(key, item) {
            fakeWindow.storage[key] = item
          },
          getItem(key) {
            return fakeWindow.storage[key]
          },
          removeItem(key) {
            delete fakeWindow.storage[key]
          },
        },
      }

      web3Service = {}
      walletService = {
        ready: true,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        once: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        purchaseKey: jest.fn().mockResolvedValue(),
      }
      update = jest.fn()

      purchase = makePurchaseCallback({
        walletService,
        web3Service,
        requiredConfirmations,
        update,
        window: fakeWindow,
      })

      await setAccount(fakeWindow, 'account')
      setBlockchainAccount('account') // this is handled in the "ensureWalletReady()" portion
      await setNetwork(fakeWindow, 2)
      await setLocks(fakeWindow, {
        lock: {
          address: 'lock',
          keyPrice: '123',
          currencyContractAddress: '0xerc20',
        },
      })
      await setKeys(fakeWindow, {
        lock: {
          lock: 'lock',
          owner: 'account',
        },
      })
    })

    it('should initiate a key purchase', async () => {
      expect.assertions(1)

      purchase('lock')

      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (walletService.purchaseKey.mock.calls.length) {
            clearInterval(interval)
            resolve()
          }
        })
      })
      expect(walletService.purchaseKey).toHaveBeenCalledWith(
        'lock',
        'account',
        '123',
        null,
        null,
        '0xerc20'
      )
    })

    it('should pass on any error thrown in keyPurchase', async () => {
      expect.assertions(1)

      const error = new Error('fail')

      walletService.purchaseKey = jest.fn().mockRejectedValue(error)

      await purchase('lock')
      expect(update).toHaveBeenCalledWith({ error })
    })

    it('should initiate monitoring of key purchase transaction', async () => {
      expect.assertions(1)

      purchase('lock')

      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (walletService.addListener.mock.calls.length) {
            clearInterval(interval)
            resolve()
          }
        })
      })

      // this is called by processKeyPurchaseTransactions, and is a quick way to verify that we
      // called it
      expect(walletService.addListener).toHaveBeenCalledWith(
        'transaction.pending',
        expect.any(Function)
      )
    })

    it('should pass on any error thrown in monitoring key purchase transaction', async () => {
      expect.assertions(1)

      const error = new Error('fail')

      walletService.on = (type, cb) => {
        if (type === 'error') {
          // trigger an error in the midst of listening for the submitted transaction
          cb(error)
        }
      }
      await purchase('lock')
      expect(update).toHaveBeenCalledWith({ error })
    })
  })
})
