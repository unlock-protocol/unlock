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

describe('Mailbox - setUserMetadata', () => {
  let constants: ConstantsType
  let win: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  let fakeWindow: FakeWindow
  let mailbox: Mailbox
  let defaults: MailboxTestDefaults

  function setupDefaults() {
    defaults = setupTestDefaults()
    constants = defaults.constants
    win = defaults.fakeWindow
    fakeWindow = win as FakeWindow
    mailbox = new Mailbox(constants, fakeWindow)
  }

  function testingMailbox(): any {
    return mailbox as any
  }

  describe('handler is not set', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should emit an error', async () => {
      expect.assertions(1)

      mailbox.setUserMetadata({
        lockAddress: '0xlockaddress',
        metadata: {},
      })

      await fakeWindow.waitForPostMessage()

      fakeWindow.expectPostMessageSent(
        PostMessages.ERROR,
        'blockchain handler not instantiated, cannot set metadata'
      )
    })
  })

  describe('handler is set', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should notify the checkout iframe of success', async () => {
      expect.assertions(1)

      testingMailbox().handler = {
        setUserMetadata: jest.fn().mockResolvedValue(''),
      }

      mailbox.setUserMetadata({
        lockAddress: '0xlockaddress',
        metadata: {},
      })

      await fakeWindow.waitForPostMessage()

      fakeWindow.expectPostMessageSent(
        PostMessages.SET_USER_METADATA_SUCCESS,
        undefined
      )
    })

    it('should notify the checkout iframe of failure', async () => {
      expect.assertions(1)

      testingMailbox().handler = {
        setUserMetadata: jest.fn().mockRejectedValue(new Error('fail')),
      }

      mailbox.setUserMetadata({
        lockAddress: '0xlockaddress',
        metadata: {},
      })

      await fakeWindow.waitForPostMessage()

      fakeWindow.expectPostMessageSent(PostMessages.ERROR, 'fail')
    })
  })
})
