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
  blockchainDataNoLocks,
  blockchainDataLocked,
  blockchainDataUnlocked,
} from '../../test-helpers/setupBlockchainHelpers'
import { PostMessages, ExtractPayload } from '../../../messageTypes'

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

describe('Mailbox - emitChanges', () => {
  let constants: ConstantsType
  let win: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  let fakeWindow: FakeWindow
  let mailbox: Mailbox
  let defaults: MailboxTestDefaults

  // all locks have had their addresses normalized before arriving
  const lockedLocks = blockchainDataLocked

  const submittedLocks = blockchainDataUnlocked

  const noLocks = blockchainDataNoLocks

  function setupDefaults() {
    defaults = setupTestDefaults()
    constants = defaults.constants
    win = defaults.fakeWindow
    fakeWindow = win as FakeWindow
    mailbox = new Mailbox(constants, fakeWindow)

    fakeWindow.clearPostMessageMock()
  }

  function testingMailbox() {
    return mailbox as any
  }

  describe('caching', () => {
    beforeEach(() => {
      setupDefaults()
      mailbox.getDataToSend = jest.fn(data => data)
    })

    it('should call the helper', () => {
      expect.assertions(1)

      testingMailbox().configuration = {
        locks: {
          [lockAddresses[0]]: { name: '' },
          [lockAddresses[1]]: { name: '' },
        },
      }
      mailbox.emitChanges(lockedLocks)

      expect(mailbox.getDataToSend).toHaveBeenCalledWith(lockedLocks)
    })
  })

  type TestSent = [string, PostMessages, ExtractPayload<PostMessages>]

  describe('with no locks', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should send neither "locked" nor "unlocked"', () => {
      expect.assertions(2)

      mailbox.emitChanges(noLocks)

      fakeWindow.expectPostMessageNotSent(PostMessages.LOCKED, undefined)
      fakeWindow.expectPostMessageNotSent(PostMessages.UNLOCKED, [])
    })
  })

  describe('with locked locks', () => {
    beforeEach(() => {
      setupDefaults()
      testingMailbox().configuration = {
        locks: {
          [lockAddresses[0]]: { name: '' },
          [lockAddresses[1]]: { name: '' },
        },
      }
    })

    it.each(<TestSent[]>[
      ['account', PostMessages.UPDATE_ACCOUNT, lockedLocks.account],
      ['network', PostMessages.UPDATE_NETWORK, lockedLocks.network],
      ['locks', PostMessages.UPDATE_LOCKS, lockedLocks.locks],
      ['balance', PostMessages.UPDATE_ACCOUNT_BALANCE, lockedLocks.balance],
      ['locked', PostMessages.LOCKED, undefined],
    ])(
      'should send the %s to the main window',
      async (_, type: PostMessages, payload: any) => {
        expect.assertions(1)

        mailbox.emitChanges(lockedLocks)

        await fakeWindow.expectPostMessageSent(type, payload)
      }
    )
  })

  describe('with unlocked locks', () => {
    beforeEach(() => {
      setupDefaults()
      testingMailbox().configuration = {
        locks: {
          [lockAddresses[0]]: { name: '' },
        },
      }

      const theFuture = new Date().getTime() / 1000 + 2000

      testingMailbox().blockchainData = blockchainDataUnlocked
      testingMailbox().blockchainData.keys[
        lockAddresses[0]
      ].expiration = theFuture
      testingMailbox().blockchainData.locks[lockAddresses[0]].key = {
        status: 'valid',
      }
    })

    it.each(<TestSent[]>[
      ['account', PostMessages.UPDATE_ACCOUNT, submittedLocks.account],
      ['network', PostMessages.UPDATE_NETWORK, submittedLocks.network],
      ['locks', PostMessages.UPDATE_LOCKS, submittedLocks.locks],
      ['balance', PostMessages.UPDATE_ACCOUNT_BALANCE, submittedLocks.balance],
      ['unlocked', PostMessages.UNLOCKED, [lockAddresses[0]]],
    ])(
      'should send the %s to the main window',
      async (_, type: PostMessages, payload: any) => {
        expect.assertions(1)

        mailbox.emitChanges(submittedLocks)

        await fakeWindow.expectPostMessageSent(type, payload)
      }
    )
  })
})
