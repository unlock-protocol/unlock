import { IframePostOfficeWindow } from '../../../windowTypes'
import {
  ConstantsType,
  FetchWindow,
  SetTimeoutWindow,
  WalletServiceType,
  Web3ServiceType,
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
import { PaywallConfig } from '../../../unlockTypes'

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

describe('Mailbox - getCacheKey', () => {
  let constants: ConstantsType
  let win: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  let fakeWindow: FakeWindow
  let mailbox: Mailbox
  let defaults: MailboxTestDefaults

  function setupDefaults() {
    defaults = setupTestDefaults()
    constants = defaults.constants
    win = defaults.fakeWindow
    fakeWindow = win as FakeWindow
    mailbox = new Mailbox(constants, fakeWindow)
  }

  function testingMailbox() {
    return mailbox as any
  }

  describe('error state', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should throw if there is no configuration set', () => {
      expect.assertions(1)

      expect(() => mailbox.getCacheKey()).toThrow(
        'internal error: cannot retrieve cache without configuration'
      )
    })
  })

  describe('valid state', () => {
    beforeEach(() => {
      setupDefaults()
      ;(testingMailbox().configuration as PaywallConfig) = {
        locks: {
          // intentionally out of alphabetical order to verify sorting
          // the configuration should be normalized by here, but this verifies that toLowerCase() is called
          [addresses[2]]: { name: '' },
          [lockAddresses[1]]: { name: '' },
        },
        callToAction: {
          default: '',
          pending: '',
          expired: '',
          confirmed: '',
        },
      }
    })

    it('should return the cache prefix plus a sorted list of lock addresses', () => {
      expect.assertions(1)

      const lockAddressPortion = JSON.stringify([
        lockAddresses[1],
        lockAddresses[2],
      ])

      expect(mailbox.getCacheKey()).toBe(
        '__unlockProtocol.cache' + lockAddressPortion
      )
    })

    it('should use the same cache for a config in a different order', () => {
      expect.assertions(1)
      ;(testingMailbox().configuration as PaywallConfig) = {
        locks: {
          // different order of locks
          [lockAddresses[1]]: { name: '' },
          [addresses[2]]: { name: '' },
        },
        callToAction: {
          default: '',
          pending: '',
          expired: '',
          confirmed: '',
        },
      }

      const lockAddressPortion = JSON.stringify([
        lockAddresses[1],
        lockAddresses[2],
      ])

      expect(mailbox.getCacheKey()).toBe(
        '__unlockProtocol.cache' + lockAddressPortion
      )
    })
  })
})
