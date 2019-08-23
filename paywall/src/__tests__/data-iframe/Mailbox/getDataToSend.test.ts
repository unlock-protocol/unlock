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
  blockchainDataLocked,
} from '../../test-helpers/setupBlockchainHelpers'

declare const process: {
  env: {
    DEBUG: any
  }
}

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

describe('Mailbox - getDataToSend', () => {
  let constants: ConstantsType
  let win: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  let fakeWindow: FakeWindow
  let mailbox: Mailbox
  let defaults: MailboxTestDefaults

  // all locks have had their addresses normalized before arriving
  const lockedLocks = blockchainDataLocked

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

  describe('caching', () => {
    beforeEach(() => {
      setupDefaults()
      mailbox.setBlockchainData = jest.fn()
    })

    it('should save the new value in the cache', () => {
      expect.assertions(1)

      testingMailbox().configuration = {
        locks: {
          [lockAddresses[0]]: { name: '' },
          [lockAddresses[1]]: { name: '' },
        },
      }
      mailbox.getDataToSend(lockedLocks)

      expect(mailbox.setBlockchainData).toHaveBeenCalledWith(lockedLocks)
    })
    describe('choosing whether to use the cache', () => {
      beforeEach(() => {
        setupDefaults()
        testingMailbox().blockchainData = lockedLocks
      })

      it('should use the cache when the BlockchainHandler has not yet retrieved the locks', () => {
        expect.assertions(2)

        const emptyData = testingMailbox().defaultBlockchainData
        const almostEmptyData = {
          ...emptyData,
          locks: {
            [lockAddresses[0]]: lockedLocks.locks[lockAddresses[0]],
          },
        }

        expect(mailbox.getDataToSend(emptyData)).toBe(lockedLocks)
        expect(mailbox.getDataToSend(almostEmptyData)).toBe(lockedLocks)
      })

      it('should set the internal store to the cache if still using it', () => {
        expect.assertions(1)

        const emptyData = testingMailbox().defaultBlockchainData

        mailbox.getDataToSend(emptyData)

        expect(testingMailbox().blockchainData).toBe(lockedLocks)
      })

      it('should log a cache notice in debug mode', () => {
        expect.assertions(1)

        const emptyData = testingMailbox().defaultBlockchainData

        process.env.DEBUG = 1
        mailbox.getDataToSend(emptyData)
        process.env.DEBUG = undefined

        expect(fakeWindow.console.log).toHaveBeenCalledWith(
          '[CACHE] using cached values'
        )
      })

      it('should use the new values when the BlockchainHandler has fully retrieved the locks', () => {
        expect.assertions(1)

        const fullData = {
          ...lockedLocks,
          account: 'hi',
        }

        expect(mailbox.getDataToSend(fullData)).toBe(fullData)
      })
    })
  })
})
