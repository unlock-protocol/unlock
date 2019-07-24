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
import { PostMessages } from '../../../messageTypes'
import {
  addresses,
  getWalletService,
  getWeb3Service,
  lockAddresses,
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

describe('Mailbox - setConfig', () => {
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

  describe('invalid configuration', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should emit an error', async () => {
      expect.assertions(1)

      mailbox.setConfig('not a valid config')
      await fakeWindow.waitForPostMessage()

      fakeWindow.expectPostMessageSent(
        PostMessages.ERROR,
        'Invalid paywall configuration, cannot continue'
      )
    })

    it('should not save the configuration', async () => {
      expect.assertions(1)

      mailbox.setConfig('not a valid config')
      await fakeWindow.waitForPostMessage()
      expect(testingMailbox().configuration).toBe(undefined)
    })
  })

  describe('valid configuration', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should normalize the lock addresses and save the configuration', () => {
      expect.assertions(1)

      const info1 = configuration.locks[addresses[0]]
      const info2 = configuration.locks[addresses[1]]
      const info3 = configuration.locks[addresses[2]]

      const expectedConfiguration = {
        ...configuration,
      }
      delete expectedConfiguration.locks
      expectedConfiguration.locks = {
        [lockAddresses[0]]: info1,
        [lockAddresses[1]]: info2,
        [lockAddresses[2]]: info3,
      }

      mailbox.setConfig(configuration)

      expect(testingMailbox().configuration).toEqual(expectedConfiguration)
    })

    describe('caching', () => {
      beforeEach(() => {
        setupDefaults()
        mailbox.getBlockchainDataFromLocalStorageCache = jest.fn()
        mailbox.setupStorageListener = jest.fn()
      })

      it('should retrive the cache', () => {
        expect.assertions(1)

        mailbox.setConfig(configuration)

        expect(
          mailbox.getBlockchainDataFromLocalStorageCache
        ).toHaveBeenCalled()
      })

      it('should begin listening for storage events', () => {
        expect.assertions(1)

        mailbox.setConfig(configuration)

        expect(mailbox.setupStorageListener).toHaveBeenCalled()
      })
    })
  })
})
