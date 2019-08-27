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

const notEnoughKeysData = {
  locks: {},
  account: null,
  balance: '0',
  network: 1984,
  keys: {},
  transactions: {},
}

const invalidKeysData = {
  ...notEnoughKeysData,
  keys: {
    [lockAddresses[0]]: {
      expiration: -1,
    },
    [lockAddresses[1]]: {
      expiration: 0,
    },
    [lockAddresses[2]]: {
      expiration: 0,
    },
  },
}

const validKeysData = {
  ...notEnoughKeysData,
  keys: {
    [lockAddresses[0]]: {
      expiration: 1,
    },
    [lockAddresses[1]]: {
      expiration: 5321,
    },
    [lockAddresses[2]]: {
      expiration: 0,
    },
  },
}

describe('Mailbox - gotAllKeysFromChain', () => {
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

    fakeWindow.clearPostMessageMock()
  }

  function testingMailbox() {
    return mailbox as any
  }

  beforeEach(() => {
    setupDefaults()
    testingMailbox().setConfig(defaults.configuration)
  })

  describe('without data and configuration', () => {
    beforeEach(() => {
      setupDefaults()
      testingMailbox().setConfig(defaults.configuration)
    })

    it('should return false when there is no blockchain data', () => {
      expect.assertions(1)

      testingMailbox().blockchainData = null

      expect(mailbox.gotAllKeysFromChain()).toBeFalsy()
    })

    it('should return false when there is no paywall configuration', () => {
      expect.assertions(1)

      testingMailbox().configuration = null

      expect(mailbox.gotAllKeysFromChain()).toBeFalsy()
    })
  })

  it('should return false when there is not a key for each lock', () => {
    expect.assertions(1)

    testingMailbox().setBlockchainData(notEnoughKeysData)

    expect(mailbox.gotAllKeysFromChain()).toBeFalsy()
  })

  it('should return false if any of the keys are fake', () => {
    expect.assertions(1)

    testingMailbox().setBlockchainData(invalidKeysData)

    expect(mailbox.gotAllKeysFromChain()).toBeFalsy()
  })

  it('should return true if all keys are real and all locks have a key', () => {
    expect.assertions(1)

    testingMailbox().setBlockchainData(validKeysData)

    expect(mailbox.gotAllKeysFromChain()).toBeTruthy()
  })
})
