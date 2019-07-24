import { IframePostOfficeWindow } from '../../../windowTypes'
import {
  ConstantsType,
  FetchWindow,
  SetTimeoutWindow,
  WalletServiceType,
  Web3ServiceType,
  BlockchainData,
} from '../../../data-iframe/blockchainHandler/blockChainTypes'
import Mailbox from '../../../data-iframe/Mailbox'
import {
  setupTestDefaults,
  MailboxTestDefaults,
} from '../../test-helpers/setupMailboxHelpers'
import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import {
  getWalletService,
  getWeb3Service,
  lockAddresses,
  addresses,
} from '../../test-helpers/setupBlockchainHelpers'
import {
  PaywallConfig,
  TransactionStatus,
  TransactionType,
} from '../../../unlockTypes'

let mockWalletService: WalletServiceType
let mockWeb3Service: Web3ServiceType
jest.mock('@unlock-protocol/unlock-js', () => {
  return {
    WalletService: () => {
      mockWalletService = getWalletService({})
      mockWalletService.connect = jest.fn((provider: any) => {
        mockWalletService.provider = provider
        return Promise.resolve()
      })
      return mockWalletService
    },
    Web3Service: () => {
      mockWeb3Service = getWeb3Service({})
      return mockWeb3Service
    },
  }
})

describe('Mailbox - invalidateLocalStorageCache', () => {
  let constants: ConstantsType
  let win: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  let fakeWindow: FakeWindow
  let mailbox: Mailbox
  let defaults: MailboxTestDefaults

  const account = addresses[1]
  // all locks have had their addresses normalized before arriving
  const blockchainData: BlockchainData = {
    account: addresses[1],
    balance: '234',
    network: 1984,
    locks: {
      [lockAddresses[0]]: {
        address: lockAddresses[0],
        name: '1',
        expirationDuration: 5,
        currencyContractAddress: addresses[2],
        keyPrice: '1',
        key: {
          status: 'none',
          confirmations: 0,
          expiration: 0,
          transactions: [],
          owner: account,
          lock: lockAddresses[0],
        },
      },
      [lockAddresses[1]]: {
        address: lockAddresses[1],
        name: '1',
        expirationDuration: 5,
        currencyContractAddress: addresses[2],
        keyPrice: '1',
        key: {
          status: 'expired',
          confirmations: 1678234,
          expiration: 163984,
          transactions: [
            {
              status: TransactionStatus.MINED,
              confirmations: 1678234,
              hash: 'hash',
              type: TransactionType.KEY_PURCHASE,
              blockNumber: 123,
            },
          ],
          owner: account,
          lock: lockAddresses[0],
        },
      },
    },
  }

  function setupDefaults(killLocalStorage = false) {
    defaults = setupTestDefaults()
    constants = defaults.constants
    win = defaults.fakeWindow
    fakeWindow = win as FakeWindow
    if (killLocalStorage) {
      fakeWindow.throwOnLocalStorageSet()
    }
    mailbox = new Mailbox(constants, fakeWindow)
    ;(testingMailbox().configuration as PaywallConfig) = {
      locks: {
        [lockAddresses[1]]: { name: '' },
        [lockAddresses[2]]: { name: '' },
      },
      callToAction: {
        default: '',
        pending: '',
        expired: '',
        confirmed: '',
      },
    }
  }

  function testingMailbox() {
    return mailbox as any
  }

  describe('error conditions', () => {
    describe('localStorage is not available', () => {
      beforeEach(() => {
        setupDefaults(true)
        fakeWindow.localStorage.removeItem = jest.fn()
      })

      it('should do nothing if localStorage is not available', () => {
        expect.assertions(1)

        mailbox.invalidateLocalStorageCache()

        expect(fakeWindow.localStorage.removeItem).not.toHaveBeenCalled()
      })
    })

    describe('configuration not received/not saved because it was invalid', () => {
      beforeEach(() => {
        setupDefaults()
        fakeWindow.localStorage.removeItem = jest.fn()
        testingMailbox().configuration = undefined
      })

      it('should do nothing if configuration is not set', () => {
        expect.assertions(1)

        mailbox.invalidateLocalStorageCache()

        expect(fakeWindow.localStorage.removeItem).not.toHaveBeenCalled()
      })
    })

    describe('localStorage throws on attempting to getItem', () => {
      beforeEach(() => {
        setupDefaults()
        fakeWindow.localStorage.clear = jest.fn()
        fakeWindow.throwOnLocalStorageRemove()
      })

      afterEach(() => {
        // reset to avoid affecting other tests
        process.env.UNLOCK_ENV = 'prod'
      })

      it('in dev, it should log the error', () => {
        expect.assertions(1)

        process.env.UNLOCK_ENV = 'dev'
        mailbox.invalidateLocalStorageCache()

        expect(fakeWindow.console.error).toHaveBeenCalledWith(expect.any(Error))
      })

      it('in other envs, it should not log the error', () => {
        expect.assertions(1)

        mailbox.invalidateLocalStorageCache()

        expect(fakeWindow.console.error).not.toHaveBeenCalled()
      })

      it('should clear the entire localStorage cache to be safe', () => {
        expect.assertions(1)

        mailbox.invalidateLocalStorageCache()

        expect(fakeWindow.localStorage.clear).toHaveBeenCalled()
      })
    })
  })

  describe('normal operation', () => {
    describe('empty cache', () => {
      beforeEach(() => {
        setupDefaults()
        ;(testingMailbox().blockchainData as BlockchainData) = blockchainData
      })

      it('should not throw if cache is empty', () => {
        expect.assertions(0)

        mailbox.getBlockchainDataFromLocalStorageCache()
      })
    })

    describe('full cache', () => {
      beforeEach(() => {
        setupDefaults()
        ;(testingMailbox().blockchainData as BlockchainData) = blockchainData
        // used to show we don't nuke other caches
        fakeWindow.localStorage.setItem('another', 'item')
        mailbox.saveCacheInLocalStorage()
      })

      it('should not remove other caches', () => {
        expect.assertions(1)

        mailbox.invalidateLocalStorageCache()

        expect(fakeWindow.localStorage.getItem('another')).toBe('item')
      })

      it('should remove the current cache', () => {
        expect.assertions(1)

        mailbox.invalidateLocalStorageCache()

        expect(
          fakeWindow.localStorage.getItem(mailbox.getCacheKey())
        ).toBeNull()
      })
    })
  })
})
