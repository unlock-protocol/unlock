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
} from '../../test-helpers/setupBlockchainHelpers'
import { PostMessages } from '../../../messageTypes'

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

describe('Mailbox - emitError', () => {
  let constants: ConstantsType
  let win: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  let fakeWindow: FakeWindow
  let mailbox: Mailbox
  let defaults: MailboxTestDefaults

  const error = new Error('fail')

  function setupDefaults() {
    defaults = setupTestDefaults()
    constants = defaults.constants
    win = defaults.fakeWindow
    fakeWindow = win as FakeWindow
    mailbox = new Mailbox(constants, fakeWindow)

    fakeWindow.clearPostMessageMock()
  }

  async function expectErrorsEmitted(error: string) {
    await fakeWindow.waitForPostMessage()
    return fakeWindow.expectPostMessageSent(PostMessages.ERROR, error)
  }

  beforeEach(() => {
    setupDefaults()
    process.env.UNLOCK_ENV = 'prod'
  })

  it('should log the error to console in development', () => {
    expect.assertions(1)

    process.env.UNLOCK_ENV = 'dev'
    mailbox.emitError(error)

    expect(fakeWindow.console.error).toHaveBeenCalledWith(error)
  })

  it('should not log the error to console in development', () => {
    expect.assertions(1)

    mailbox.emitError(error)

    expect(fakeWindow.console.error).not.toHaveBeenCalled()
  })

  it('should postMessage the error message to the main window', async () => {
    expect.assertions(1)

    mailbox.emitError(error)

    await expectErrorsEmitted('fail')
  })
})
