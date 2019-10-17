import { IframePostOfficeWindow } from '../../../windowTypes'
import {
  ConstantsType,
  FetchWindow,
  SetTimeoutWindow,
  WalletServiceType,
  Web3ServiceType,
} from '../../../data-iframe/blockchainHandler/blockChainTypes'
import { PaywallConfig } from '../../../unlockTypes'
import Mailbox from '../../../data-iframe/Mailbox'
import {
  setupTestDefaults,
  MailboxTestDefaults,
} from '../../test-helpers/setupMailboxHelpers'
import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import {
  getWalletService,
  getWeb3Service,
} from '../../test-helpers/setupBlockchainHelpers'

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

describe('Mailbox - setupStorageListener', () => {
  let constants: ConstantsType
  let configuration: PaywallConfig
  let win: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  let fakeWindow: FakeWindow
  let mailbox: Mailbox
  let defaults: MailboxTestDefaults

  function setupDefaults() {
    defaults = setupTestDefaults()
    constants = defaults.constants
    configuration = defaults.configuration
    win = defaults.fakeWindow
    fakeWindow = win as FakeWindow
    mailbox = new Mailbox(constants, fakeWindow)
  }

  function testingMailbox(): any {
    return mailbox as any
  }

  beforeEach(() => {
    setupDefaults()
    fakeWindow.addEventListener = jest.fn()
  })

  it('should set up a listener for storage events', () => {
    expect.assertions(1)

    mailbox.setupStorageListener()

    if (testingMailbox().useLocalStorageCache) {
      expect(fakeWindow.addEventListener).toHaveBeenCalledWith(
        'storage',
        expect.any(Function)
      )
    } else {
      expect(fakeWindow.addEventListener).not.toHaveBeenCalledWith(
        'storage',
        expect.any(Function)
      )
    }
  })

  describe('event listener', () => {
    describe('error states', () => {
      beforeEach(() => {
        setupDefaults()
        mailbox.setupStorageListener()
        testingMailbox().configuration = configuration
        // enable caching to test functionality
        testingMailbox().useLocalStorageCache = true
      })

      it('should do nothing if there is no configuration', () => {
        expect.assertions(1)

        const cacheKey = mailbox.getCacheKey()
        mailbox.getCacheKey = jest.fn()
        testingMailbox().configuration = undefined

        fakeWindow.receiveStorageEvent(cacheKey, 'old', 'new')

        expect(mailbox.getCacheKey).not.toHaveBeenCalled()
      })

      it('should do nothing if there is no handler', () => {
        expect.assertions(1)

        const cacheKey = mailbox.getCacheKey()
        mailbox.getCacheKey = jest.fn()
        testingMailbox().configuration = configuration
        testingMailbox().handler = undefined

        fakeWindow.receiveStorageEvent(cacheKey, 'old', 'new')

        expect(mailbox.getCacheKey).not.toHaveBeenCalled()
      })
    })

    describe('valid states', () => {
      beforeEach(() => {
        setupDefaults()
        // enable caching to test functionality
        testingMailbox().useLocalStorageCache = true
        mailbox.setupStorageListener()
        testingMailbox().configuration = configuration
        testingMailbox().handler = {
          retrieveCurrentBlockchainData: jest.fn(),
        }
      })

      it('should not retrieve data for a different cache key', () => {
        expect.assertions(1)

        fakeWindow.receiveStorageEvent('different cache', 'old', 'new')

        expect(
          testingMailbox().handler.retrieveCurrentBlockchainData
        ).not.toHaveBeenCalled()
      })

      it("should retrieve data for this paywall's cache key", () => {
        expect.assertions(1)

        fakeWindow.receiveStorageEvent(mailbox.getCacheKey(), 'old', 'new')

        expect(
          testingMailbox().handler.retrieveCurrentBlockchainData
        ).toHaveBeenCalled()
      })
    })
  })
})
