import {
  getLocks,
  linkKeysToLocks,
} from '../../../data-iframe/blockchainHandler/getLocks'
import { setAccount } from '../../../data-iframe/blockchainHandler/account'

jest.mock('../../../data-iframe/blockchainHandler/ensureWalletReady')

describe('Locks retrieval', () => {
  describe('getLocks', () => {
    let fakeWeb3Service
    beforeEach(() => {
      fakeWeb3Service = {
        getLock: jest.fn(address => Promise.resolve({ address })),
      }
    })

    it('calls web3Service.getLock for all the locks', async () => {
      expect.assertions(4)

      await getLocks({
        locksToRetrieve: [1, 2, 3],
        web3Service: fakeWeb3Service,
      })

      expect(fakeWeb3Service.getLock).toHaveBeenCalledTimes(3)
      expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(1, 1)
      expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(2, 2)
      expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(3, 3)
    })

    it('returns the locks indexed by address', async () => {
      expect.assertions(1)

      setAccount('account')
      const result = await getLocks({
        locksToRetrieve: [1, 2, 3],
        web3Service: fakeWeb3Service,
      })

      expect(result).toEqual({
        1: { address: 1 },
        2: { address: 2 },
        3: { address: 3 },
      })
    })
  })

  describe('linkKeysToLocks', () => {
    let fakeWeb3Service
    let fakeWalletService

    beforeEach(() => {
      fakeWalletService = {}
      fakeWeb3Service = {
        keyExpiry: {},
        getKeyByLockForOwner(lock) {
          return {
            id: 'whatever' + lock,
            lock,
            owner: 'account',
            expiration: fakeWeb3Service.keyExpiry[lock] || 0,
          }
        },
      }
    })

    it('links keys to the locks they unlock', async () => {
      expect.assertions(1)

      const locks = {
        '0x123': {
          address: '0x123',
          keyPrice: '5',
          expirationDuration: '6',
          maxNumberOfKeys: 4,
        },
        '0x456': {
          address: '0x456',
          keyPrice: '55',
          expirationDuration: '66',
          maxNumberOfKeys: 44,
        },
      }

      fakeWeb3Service.keyExpiry = {
        '0x123': new Date().getTime() / 1000 + 123,
        // no expiry for '0x456' means 0
      }

      const transactions = {
        hash: {
          hash: 'hash',
          from: 'account',
          to: '0x123',
          key: '0x123-account',
          lock: '0x123',
          status: 'mined',
          confirmations: 2,
          blockNumber: 5,
        },
        old: {
          hash: 'old',
          from: 'account',
          to: '0x123',
          key: '0x123-account',
          lock: '0x123',
          status: 'mined',
          confirmations: 223,
          blockNumber: 4,
        },
      }

      const newLocks = await linkKeysToLocks({
        locks,
        walletService: fakeWalletService,
        transactions,
        web3Service: fakeWeb3Service,
        requiredConfirmations: 3,
      })

      expect(newLocks).toEqual({
        '0x123': {
          ...locks['0x123'],
          key: {
            confirmations: 2,
            expiration: fakeWeb3Service.keyExpiry['0x123'],
            id: 'whatever0x123',
            lock: '0x123',
            owner: 'account',
            status: 'confirming',
            transactions: [transactions.hash, transactions.old],
          },
        },
        '0x456': {
          ...locks['0x456'],
          key: {
            confirmations: 0,
            expiration: 0,
            id: 'whatever0x456',
            lock: '0x456',
            owner: 'account',
            status: 'none',
            transactions: [],
          },
        },
      })
    })
  })
})
