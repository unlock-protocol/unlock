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

describe('Mailbox - sendUpdates', () => {
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
  const testingDataWithoutLocks: BlockchainData = {
    locks: {},
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
      testingMailbox().blockchainData = testingData
    })

    it('should send account when requested', async () => {
      expect.assertions(1)

      mailbox.sendUpdates('account')
      await fakeWindow.waitForPostMessage()

      fakeWindow.expectPostMessageSent(
        PostMessages.UPDATE_ACCOUNT,
        testingData.account
      )
    })

    it('should send account balance when requested', async () => {
      expect.assertions(1)

      mailbox.sendUpdates('balance')
      await fakeWindow.waitForPostMessage()

      fakeWindow.expectPostMessageSent(
        PostMessages.UPDATE_ACCOUNT_BALANCE,
        testingData.balance
      )
    })

    it('should send network when requested', async () => {
      expect.assertions(1)

      mailbox.sendUpdates('network')
      await fakeWindow.waitForPostMessage()

      fakeWindow.expectPostMessageSent(
        PostMessages.UPDATE_NETWORK,
        testingData.network
      )
    })

    describe('locks', () => {
      beforeEach(() => {
        setupDefaults()
        testingMailbox().blockchainData = testingData
      })

      it('should send locks when requested', async () => {
        expect.assertions(1)

        mailbox.sendUpdates('locks')
        await fakeWindow.waitForPostMessage()

        fakeWindow.expectPostMessageSent(
          PostMessages.UPDATE_LOCKS,
          testingData.locks
        )
      })

      it('should send neither "locked" nor "unlocked" when there are no locks', () => {
        expect.assertions(2)
        const payload = undefined
        testingMailbox().blockchainData = testingDataWithoutLocks

        mailbox.sendUpdates('locks')

        fakeWindow.expectPostMessageNotSent(PostMessages.LOCKED, payload)
        fakeWindow.expectPostMessageNotSent(PostMessages.UNLOCKED, [])
      })

      it('should send "locked" when there are no valid keys', async () => {
        expect.assertions(1)

        const payload = undefined
        mailbox.sendUpdates('locks')
        await fakeWindow.waitForPostMessage()

        fakeWindow.expectPostMessageSent(PostMessages.LOCKED, payload)
      })

      it('should send "unlocked" when there are valid keys', async () => {
        expect.assertions(1)
        ;(testingMailbox().blockchainData as BlockchainData).locks[
          lockAddresses[0]
        ].key.status = 'valid'

        const payload = [lockAddresses[0]]
        mailbox.sendUpdates('locks')
        await fakeWindow.waitForPostMessage()

        fakeWindow.expectPostMessageSent(PostMessages.UNLOCKED, payload)
      })

      it('should emit an error when the update requested is an unknown string', async () => {
        expect.assertions(1)

        const a: any = mailbox.sendUpdates as any
        a('oops')
        await fakeWindow.waitForPostMessage()

        fakeWindow.expectPostMessageSent(
          PostMessages.ERROR,
          'Unknown update requested: "oops"'
        )
      })

      it('should emit an error when the update requested is an unknown something else', async () => {
        expect.assertions(1)

        const a: any = mailbox.sendUpdates as any
        a({ double: 'oops' })
        await fakeWindow.waitForPostMessage()

        fakeWindow.expectPostMessageSent(
          PostMessages.ERROR,
          'Unknown update requested: <invalid value>'
        )
      })
    })
  })
})
