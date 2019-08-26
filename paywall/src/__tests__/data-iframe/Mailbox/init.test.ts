import * as unlock from '@unlock-protocol/unlock-js'
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
import BlockchainHandler from '../../../data-iframe/blockchainHandler/BlockchainHandler'
import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PostMessages } from '../../../messageTypes'
import { waitFor } from '../../../utils/promises'
import {
  getWalletService,
  getWeb3Service,
} from '../../test-helpers/setupBlockchainHelpers'

let mockWalletService: WalletServiceType
let mockWeb3Service: Web3ServiceType
jest.mock('@unlock-protocol/unlock-js', () => {
  return {
    WalletService: jest.fn(function() {
      mockWalletService = getWalletService({})
      mockWalletService.connect = jest.fn((provider: any) => {
        mockWalletService.provider = provider
        return Promise.resolve()
      })
      return mockWalletService
    }),
    Web3Service: function() {
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

  function setupDefaults(sendConfig = true) {
    defaults = setupTestDefaults()
    constants = defaults.constants
    configuration = defaults.configuration
    win = defaults.fakeWindow
    fakeWindow = win as FakeWindow
    mailbox = new Mailbox(constants, fakeWindow)

    if (!sendConfig) return

    fakeWindow.receivePostMessageFromMainWindow(
      PostMessages.CONFIG,
      configuration
    )
    ;(fakeWindow.parent as any).postMessage.mockClear()
  }

  function testingMailbox(): any {
    return mailbox as any
  }

  beforeEach(() => {
    setupDefaults()
  })

  it('should wait for configuration before initializing walletService', async () => {
    expect.assertions(2)

    setupDefaults(false)
    ;(unlock.WalletService as any).mockImplementationOnce(function() {
      mockWalletService = getWalletService({})
      mockWalletService.connect = jest.fn((provider: any) => {
        mockWalletService.provider = provider
        // eslint-disable-next-line promise/param-names
        return new Promise(_ => {}) // never resolve
      })
      return mockWalletService
    })

    mailbox.init()

    await waitFor(() => !!mockWalletService)
    expect(mockWalletService.connect).not.toHaveBeenCalled()

    fakeWindow.receivePostMessageFromMainWindow(
      PostMessages.CONFIG,
      configuration
    )

    const mock: any = mockWalletService.connect

    await fakeWindow.waitForPostMessage()
    await waitFor(() => mock.mock.calls.length)

    expect(mockWalletService.connect).toHaveBeenCalled()

    // demonstrate that the handler is created even though connection has not finished
    await waitFor(() => testingMailbox().handler)
  })

  describe('errors', () => {
    beforeEach(() => {
      setupDefaults(false)
      ;(unlock.WalletService as any).mockImplementationOnce(function() {
        mockWalletService = getWalletService({})
        mockWalletService.connect = jest.fn((provider: any) => {
          mockWalletService.provider = provider
          return Promise.reject(new Error('fail'))
        })
        return mockWalletService
      })
    })

    it('should emit an error if connecting to the provider fails', async done => {
      expect.assertions(1)

      mailbox.emitError = (e: Error) => {
        expect(e.message).toMatch('fail')
        done()
      }

      mailbox.init()

      fakeWindow.receivePostMessageFromMainWindow(
        PostMessages.CONFIG,
        configuration
      )
    })
  })

  it('should initialize a BlockchainHandler', async () => {
    expect.assertions(1)

    mailbox.init().then(() => {
      expect(testingMailbox().handler).toBeInstanceOf(BlockchainHandler)
    })

    fakeWindow.receivePostMessageFromMainWindow(PostMessages.WALLET_INFO, {
      noWallet: false,
      notEnabled: false,
      isMetamask: false,
    })

    await waitFor(() => testingMailbox().handler)
  })

  it('should retrieve current blockchain data', async () => {
    expect.assertions(1)

    mailbox.emitChanges = jest.fn()
    mailbox.init()

    fakeWindow.receivePostMessageFromMainWindow(PostMessages.WALLET_INFO, {
      noWallet: false,
      notEnabled: false,
      isMetamask: false,
    })

    await waitFor(() => testingMailbox().handler)

    const mock: any = mailbox.emitChanges
    await waitFor(() => mock.mock.calls.length)

    expect(mailbox.emitChanges).toHaveBeenCalledWith({
      account: null,
      balance: '0',
      locks: {},
      network: 1984,
      // Even though we are in a null state (just initialized), there
      // are keys here because of makeDefaultKeys. Somewhat confusing,
      // but at least there's a comment now.
      keys: {
        '0x15b87bdc4b3ecb783f56f735653332ead3bca5f8': {
          expiration: -1,
          lock: '0x15b87bdc4b3ecb783f56f735653332ead3bca5f8',
          owner: null,
        },
        '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2': {
          expiration: -1,
          lock: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
          owner: null,
        },
        '0xbf7f1bdb3a2d6c318603ffc8f39974e597b6af5e': {
          expiration: -1,
          lock: '0xbf7f1bdb3a2d6c318603ffc8f39974e597b6af5e',
          owner: null,
        },
      },
      transactions: {},
    })
  })
})
