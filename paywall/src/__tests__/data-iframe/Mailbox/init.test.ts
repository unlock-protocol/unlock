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
    Web3Service: jest.fn(function() {
      mockWeb3Service = getWeb3Service({})
      return mockWeb3Service
    }),
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

  it('should connect to walletService', async () => {
    expect.assertions(1)

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

  it('should instantiate a BlockchainHandler', async () => {
    expect.assertions(1)

    mailbox.init().then(() => {
      expect(testingMailbox().handler).toBeInstanceOf(BlockchainHandler)
    })

    fakeWindow.receivePostMessageFromMainWindow(PostMessages.WALLET_INFO, {
      noWallet: false,
      notEnabled: false,
      isMetaMask: false,
    })

    await waitFor(() => testingMailbox().handler)
  })

  it('should begin listening for storage events', () => {
    expect.assertions(1)

    mailbox.setupStorageListener = jest.fn(() => {})
    mailbox.init()

    expect(mailbox.setupStorageListener).toHaveBeenCalled()
  })
})
