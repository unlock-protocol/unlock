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

describe('Mailbox - refreshBlockchainTransactions', () => {
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

    fakeWindow.receivePostMessageFromMainWindow(
      PostMessages.CONFIG,
      configuration
    )
  }

  function testingMailbox(): any {
    return mailbox as any
  }

  beforeEach(() => {
    setupDefaults()
  })

  it('should not crash if the BlockchainHandler has not been set yet', () => {
    expect.assertions(0)

    testingMailbox().handler = undefined
    fakeWindow.receivePostMessageFromMainWindow(
      PostMessages.INITIATED_TRANSACTION,
      undefined
    )
  })

  it('should call retrieveTransactions on the BlockchainHandler', () => {
    expect.assertions(1)

    testingMailbox().handler = {
      retrieveTransactions: jest.fn(),
    }
    fakeWindow.receivePostMessageFromMainWindow(
      PostMessages.INITIATED_TRANSACTION,
      undefined
    )

    expect(testingMailbox().handler.retrieveTransactions).toHaveBeenCalled()
  })
})
