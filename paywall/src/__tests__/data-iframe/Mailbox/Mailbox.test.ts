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

describe('Mailbox - constructor', () => {
  let constants: ConstantsType
  let win: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  let fakeWindow: FakeWindow
  let mailbox: Mailbox
  let defaults: MailboxTestDefaults
  defaults = setupTestDefaults()

  function setupDefaults() {
    constants = defaults.constants
    win = defaults.fakeWindow
    fakeWindow = win as FakeWindow
    mailbox = new Mailbox(constants, fakeWindow)
  }

  function testingMailbox(): any {
    return mailbox as any
  }

  beforeEach(() => {
    setupDefaults()
  })

  it('should set up postMessage functions', () => {
    expect.assertions(1)

    testingMailbox().postMessage(PostMessages.READY, undefined)
    fakeWindow.expectPostMessageSent(PostMessages.READY, undefined)
  })

  it('should set up addPostMessageListener function', async () => {
    expect.assertions(1)

    const handler = jest.fn()
    const payload = undefined

    testingMailbox().addPostMessageListener(PostMessages.REDIRECT, handler)

    fakeWindow.receivePostMessageFromMainWindow(PostMessages.REDIRECT, payload)

    await waitFor(() => handler.mock.calls.length)

    expect(handler).toHaveBeenCalledWith(payload, expect.any(Function)) // the 2nd argument is the "respond" function
  })

  it('should call setupPostMessageListeners', async () => {
    expect.assertions(1)

    // this is the last line of "setupPostMessageListeners"
    await fakeWindow.expectPostMessageSent(PostMessages.READY, undefined)
  })

  describe('setting values', () => {
    beforeEach(() => {
      setupDefaults()
    })
    type TestValues = [string, any]

    it.each(<TestValues[]>[
      ['constants', defaults.constants],
      ['window', defaults.fakeWindow],
    ])('should initialize %s', (member, value) => {
      expect.assertions(1)

      expect(testingMailbox()[member]).toBe(value)
    })

    it.each([
      'setConfig',
      'sendUpdates',
      'purchaseKey',
      'refreshBlockchainTransactions',
      'emitChanges',
      'emitError',
      'signData',
    ])('this.%s should be bound to the current instance', func => {
      expect.assertions(1)

      // based on https://stackoverflow.com/a/35687230

      expect(testingMailbox()[func].hasOwnProperty('prototype')).toBeFalsy()
    })
  })
})
