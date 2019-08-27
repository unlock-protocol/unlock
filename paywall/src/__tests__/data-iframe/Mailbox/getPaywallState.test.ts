import { IframePostOfficeWindow } from '../../../windowTypes'
import {
  ConstantsType,
  FetchWindow,
  SetTimeoutWindow,
  WalletServiceType,
  Web3ServiceType,
} from '../../../data-iframe/blockchainHandler/blockChainTypes'
import Mailbox, { PaywallStatus } from '../../../data-iframe/Mailbox'
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
      expiration: 0,
    },
    [lockAddresses[1]]: {
      expiration: 0,
    },
    [lockAddresses[2]]: {
      expiration: 0,
    },
  },
}

const theFuture = new Date().getTime() / 1000 + 2000
const validKeysData = {
  ...notEnoughKeysData,
  keys: {
    [lockAddresses[0]]: {
      expiration: 1,
    },
    [lockAddresses[1]]: {
      expiration: theFuture,
    },
    [lockAddresses[2]]: {
      expiration: 0,
    },
  },
}

describe('Mailbox - getPaywallState', () => {
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

  it('should return PaywallStatus.none when we do not have all keys from chain', () => {
    expect.assertions(1)

    testingMailbox().setBlockchainData(notEnoughKeysData)

    expect(mailbox.getPaywallState()).toBe(PaywallStatus.none)
  })

  it('should return PaywallStatus.locked when no keys are valid', () => {
    expect.assertions(1)

    testingMailbox().setBlockchainData(invalidKeysData)

    expect(mailbox.getPaywallState()).toBe(PaywallStatus.locked)
  })

  it('should return PaywallStatus.unlocked when there is a valid key', () => {
    expect.assertions(1)

    testingMailbox().setBlockchainData(validKeysData)

    expect(mailbox.getPaywallState()).toBe(PaywallStatus.unlocked)
  })
})
