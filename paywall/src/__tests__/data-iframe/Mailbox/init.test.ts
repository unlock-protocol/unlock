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
  addresses,
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

describe('Mailbox - init', () => {
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

  // async function resetPostMessageAndWait() {
  //   ;(fakeWindow.parent as any).postMessage.mockClear()

  //   await waitFor(
  //     () => (fakeWindow.parent as any).postMessage.mock.calls.length
  //   )
  // }

  beforeEach(() => {
    setupDefaults()
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
})
