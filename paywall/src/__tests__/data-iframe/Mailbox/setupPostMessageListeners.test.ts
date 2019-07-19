import { IframePostOfficeWindow } from '../../../windowTypes'
import {
  ConstantsType,
  FetchWindow,
  SetTimeoutWindow,
  WalletServiceType,
  Web3ServiceType,
} from '../../../data-iframe/blockchainHandler/blockChainTypes'
import { PaywallConfig, PurchaseKeyRequest } from '../../../unlockTypes'
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

describe('Mailbox - setupPostMessageListeners', () => {
  let constants: ConstantsType
  let configuration: PaywallConfig
  let win: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  let fakeWindow: FakeWindow
  let mailbox: Mailbox
  let defaults: MailboxTestDefaults

  function setupDefaults(noConfig: boolean = false) {
    defaults = setupTestDefaults()
    constants = defaults.constants
    configuration = defaults.configuration
    win = defaults.fakeWindow
    fakeWindow = win as FakeWindow
    fakeWindow.respondToWeb3(1, addresses[0])
    mailbox = new Mailbox(constants, fakeWindow)

    if (noConfig) {
      testingMailbox().setConfig = jest.fn()
      testingMailbox().sendUpdates = jest.fn()
      testingMailbox().purchaseKey = jest.fn()
      mailbox.setupPostMessageListeners()
      return
    }

    fakeWindow.receivePostMessageFromMainWindow(
      PostMessages.CONFIG,
      configuration
    )
  }

  function testingMailbox(): any {
    return mailbox as any
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

  describe('constructor', () => {
    beforeEach(() => {
      setupDefaults(true)
    })

    it('should set up postMessage functions', () => {
      expect.assertions(1)

      testingMailbox().postMessage(PostMessages.SCROLL_POSITION, 5)
      expectPostMessageSent(PostMessages.SCROLL_POSITION, 5)
    })

    it('should set up addPostMessageListener function', async () => {
      expect.assertions(1)

      const handler = jest.fn()
      const payload = undefined

      testingMailbox().addPostMessageListener(PostMessages.REDIRECT, handler)

      fakeWindow.receivePostMessageFromMainWindow(
        PostMessages.REDIRECT,
        payload
      )

      await waitFor(() => handler.mock.calls.length)

      expect(handler).toHaveBeenCalledWith(payload, expect.any(Function)) // the 2nd argument is the "respond" function
    })
  })

  describe('setupPostMessageListeners', () => {
    beforeEach(() => {
      setupDefaults(true)
    })

    it('should listen for the paywall configuration', () => {
      expect.assertions(1)

      fakeWindow.receivePostMessageFromMainWindow(
        PostMessages.CONFIG,
        configuration
      )

      // called with the payload, and a function that can be used to respond
      expect(testingMailbox().setConfig).toHaveBeenCalledWith(
        configuration,
        expect.any(Function)
      )
    })

    it('should listen for requests to send data updates to the main window', () => {
      expect.assertions(1)

      fakeWindow.receivePostMessageFromMainWindow(
        PostMessages.SEND_UPDATES,
        'account'
      )

      // called with the payload, and a function that can be used to respond
      expect(testingMailbox().sendUpdates).toHaveBeenCalledWith(
        'account',
        expect.any(Function)
      )
    })

    it('should listen for requests to purchase a key on a lock', () => {
      expect.assertions(1)

      const purchaseRequest: PurchaseKeyRequest = {
        lock: lockAddresses[0],
        extraTip: '0',
      }
      fakeWindow.receivePostMessageFromMainWindow(
        PostMessages.PURCHASE_KEY,
        purchaseRequest
      )

      // called with the payload, and a function that can be used to respond
      expect(testingMailbox().purchaseKey).toHaveBeenCalledWith(
        purchaseRequest,
        expect.any(Function)
      )
    })

    it('should send PostMessages.READY to the main window', () => {
      expect.assertions(1)

      expect(fakeWindow.parent.postMessage).toHaveBeenCalledWith(
        {
          type: PostMessages.READY,
          payload: undefined,
        },
        'http://example.com'
      )
    })
  })
})
