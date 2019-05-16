import ensureWalletReady from '../../../data-iframe/blockchainHandler/ensureWalletReady'
import { setAccount } from '../../../data-iframe/blockchainHandler/account'
import { setNetwork } from '../../../data-iframe/blockchainHandler/network'
import {
  processKeyPurchaseTransaction,
  purchaseKey,
  handleTransactionUpdate,
} from '../../../data-iframe/blockchainHandler/purchaseKey'

jest.mock('../../../data-iframe/blockchainHandler/ensureWalletReady', () =>
  jest.fn().mockResolvedValue()
)
describe('blockchainHandler purchaseKey', () => {
  let fakeWalletService
  describe('purchaseKey', () => {
    beforeEach(() => {
      fakeWalletService = {
        purchaseKey: jest.fn(),
      }
    })

    it('ensures wallet is ready first', async () => {
      expect.assertions(1)

      setAccount('account')
      await purchaseKey(fakeWalletService, window, 'lock')
      expect(ensureWalletReady).toHaveBeenCalled()
    })

    it('calls purchaseKey with the key id to purchase', async () => {
      expect.assertions(1)

      setAccount('account')
      await purchaseKey(fakeWalletService, window, 'lock')
      expect(fakeWalletService.purchaseKey).toHaveBeenCalledWith('lock-account')
    })
  })

  describe('processKeyPurchaseTransaction', () => {
    it('returns correct values, ready for getKeyPurchaseTransactionMonitor', async () => {
      expect.assertions(1)

      setAccount('account')
      setNetwork('network')
      const network = 'network'
      const web3Service = 'hi'
      const walletService = 'hi'
      const lock = 'lock'
      const requiredConfirmations = 15
      const existingTransactions = {
        transaction: 'hi',
      }
      const existingKeys = {
        key: 'hi',
      }

      const values = await processKeyPurchaseTransaction({
        web3Service,
        walletService,
        lock,
        requiredConfirmations,
        existingTransactions,
        existingKeys,
      })

      expect(values).toEqual({
        walletService,
        network,
        lock,
        keyToPurchase: 'lock-account',
        transactions: existingTransactions,
        keys: existingKeys,
        requiredConfirmations,
        web3Service,
      })
    })
  })

  describe('getKeyPurchaseTransactionMonitor', () => {
    it.todo('rejects on error')
    it.todo('resolves on receiving "transaction.pending" to a new promise')
    it.todo('post-pending promise rejects on error')
    it.todo('post-pending promise resolves on "transaction.new"')
    it.todo(
      'post-pending promise result includes listener for next confirmation'
    )
  })
  describe('handleTransactionUpdate', () => {
    const keyToPurchase = 'myKey'
    const requiredConfirmations = 12
    const hash = 'hash'
    const transaction = {
      hash: 'hash',
    }
    const transactions = {
      hash: transaction,
    }
    const keys = {
      myKey: {
        id: 'myKey',
      },
    }

    it('if fully confirmed resolves with boundary condition', async () => {
      expect.assertions(1)

      const update = {
        thing: 1,
        confirmations: 12,
      }
      const web3Service = {}

      const value = await handleTransactionUpdate({
        transaction,
        hash,
        update,
        transactions,
        keyToPurchase,
        requiredConfirmations,
        web3Service,
        keys,
      })

      expect(value).toEqual({
        nextConfirmation: false,
        transactions: {
          hash: {
            ...transaction,
            ...update,
          },
        },
        keys: {
          myKey: {
            id: 'myKey',
            transactions: {
              hash: {
                ...transaction,
                ...update,
              },
            },
          },
        },
      })
    })

    it('resolves to a listener for the next confirmation', async done => {
      expect.assertions(1)

      const update = {
        thing: 1,
        confirmations: 11,
      }
      const web3Service = {
        listeners: {},
        once(type, cb) {
          web3Service.listeners[type] = cb
        },
      }

      handleTransactionUpdate({
        transaction,
        hash,
        update,
        transactions,
        keyToPurchase,
        requiredConfirmations,
        web3Service,
        keys,
      }).then(value => {
        expect(value).toEqual({
          nextConfirmation: expect.any(Function),
          transactions,
          keys,
        })
        done()
      })
      web3Service.listeners['transaction.updated'](hash, update)
    })

    it('rejects on error', async done => {
      expect.assertions(1)

      const update = {
        thing: 1,
        confirmations: 11,
      }
      const web3Service = {
        listeners: {},
        once(type, cb) {
          web3Service.listeners[type] = cb
        },
      }

      handleTransactionUpdate({
        transaction,
        hash,
        update,
        transactions,
        keyToPurchase,
        requiredConfirmations,
        web3Service,
        keys,
      }).catch(e => {
        expect(e.message).toBe('oops')
        done()
      })
      web3Service.listeners.error(new Error('oops'))
    })
  })
})
