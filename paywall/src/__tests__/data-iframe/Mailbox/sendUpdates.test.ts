import { IframePostOfficeWindow } from '../../../windowTypes'
import {
  ConstantsType,
  FetchWindow,
  SetTimeoutWindow,
  WalletServiceType,
  Web3ServiceType,
  BlockchainData,
} from '../../../data-iframe/blockchainHandler/blockChainTypes'
import { PaywallConfig } from '../../../unlockTypes'
import Mailbox from '../../../data-iframe/Mailbox'
import {
  setupTestDefaults,
  MailboxTestDefaults,
} from '../../test-helpers/setupMailboxHelpers'
import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PostMessages, ExtractPayload } from '../../../messageTypes'
import {
  addresses,
  getWalletService,
  getWeb3Service,
  lockAddresses,
} from '../../test-helpers/setupBlockchainHelpers'
import { waitFor } from '../../../utils/promises'

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

describe('Mailbox - init', () => {
  let constants: ConstantsType
  let configuration: PaywallConfig
  let win: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  let fakeWindow: FakeWindow
  let mailbox: Mailbox
  let defaults: MailboxTestDefaults
  const testingData: BlockchainData = {
    locks: {
      [lockAddresses[0]]: {
        name: 'lock 1',
        address: lockAddresses[0],
        keyPrice: '1',
        expirationDuration: 5,
        currencyContractAddress: null,
        key: {
          expiration: 0,
          status: 'none',
          confirmations: 0,
          owner: addresses[1],
          transactions: [],
          lock: lockAddresses[0],
        },
      },
    },
    account: addresses[1],
    balance: '123',
    network: 1,
  }

  function setupDefaults() {
    defaults = setupTestDefaults()
    constants = defaults.constants
    configuration = defaults.configuration
    win = defaults.fakeWindow
    fakeWindow = win as FakeWindow
    fakeWindow.respondToWeb3(1, addresses[0])
    mailbox = new Mailbox(constants, fakeWindow)

    fakeWindow.receivePostMessageFromMainWindow(
      PostMessages.CONFIG,
      configuration
    )
    ;(fakeWindow.parent as any).postMessage.mockClear()
  }

  function testingMailbox(): any {
    return mailbox as any
  }

  function waitForPostMessage() {
    return waitFor(
      () => (fakeWindow.parent as any).postMessage.mock.calls.length
    )
  }

  function expectPostMessageSent<T extends PostMessages = PostMessages>(
    type: T,
    payload: ExtractPayload<T>
  ) {
    expect(fakeWindow.parent.postMessage).toHaveBeenCalledWith(
      {
        type,
        payload,
      },
      'http://example.com' // origin passed in the URL as ?origin=<urlencoded origin>
    )
  }

  describe('blockchain is not ready yet', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should do nothing', () => {
      expect.assertions(1)

      expect(() => {
        // this function only accepts "locks", "account", "network" and "balance"
        // so the following request will throw if the function executes.
        // Because of strict typing, we have to use "as any" to pass in the invalid value
        ;(mailbox.sendUpdates as any)('oops')
      }).not.toThrow()
    })
  })

  describe('blockchain has sent data down', () => {
    beforeEach(() => {
      setupDefaults()
      testingMailbox().data = testingData
    })

    it('should send account when requested', async () => {
      expect.assertions(1)

      mailbox.sendUpdates('account')
      await waitForPostMessage()

      expectPostMessageSent(PostMessages.UPDATE_ACCOUNT, testingData.account)
    })

    it('should send account balance when requested', async () => {
      expect.assertions(1)

      mailbox.sendUpdates('balance')
      await waitForPostMessage()

      expectPostMessageSent(
        PostMessages.UPDATE_ACCOUNT_BALANCE,
        testingData.balance
      )
    })

    it('should send network when requested', async () => {
      expect.assertions(1)

      mailbox.sendUpdates('network')
      await waitForPostMessage()

      expectPostMessageSent(PostMessages.UPDATE_NETWORK, testingData.network)
    })

    describe('locks', () => {
      beforeEach(() => {
        setupDefaults()
        testingMailbox().data = testingData
      })

      it('should send locks when requested', async () => {
        expect.assertions(1)

        mailbox.sendUpdates('locks')
        await waitForPostMessage()

        expectPostMessageSent(PostMessages.UPDATE_LOCKS, testingData.locks)
      })

      it('should send "locked" when there are no valid keys', async () => {
        expect.assertions(1)

        const payload = undefined
        mailbox.sendUpdates('locks')
        await waitForPostMessage()

        expectPostMessageSent(PostMessages.LOCKED, payload)
      })

      it('should send "unlocked" when there are valid keys', async () => {
        expect.assertions(1)
        ;(testingMailbox().data as BlockchainData).locks[
          lockAddresses[0]
        ].key.status = 'valid'

        const payload = [lockAddresses[0]]
        mailbox.sendUpdates('locks')
        await waitForPostMessage()

        expectPostMessageSent(PostMessages.UNLOCKED, payload)
      })
    })
  })
})
