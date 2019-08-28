import { IframePostOfficeWindow } from '../../../windowTypes'
import {
  ConstantsType,
  FetchWindow,
  SetTimeoutWindow,
  WalletServiceType,
  Web3ServiceType,
  BlockchainData,
} from '../../../data-iframe/blockchainHandler/blockChainTypes'
import { PurchaseKeyRequest } from '../../../unlockTypes'
import Mailbox from '../../../data-iframe/Mailbox'
import {
  setupTestDefaults,
  MailboxTestDefaults,
} from '../../test-helpers/setupMailboxHelpers'
import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import { PostMessages } from '../../../messageTypes'
import {
  addresses,
  getWalletService,
  getWeb3Service,
  lockAddresses,
} from '../../test-helpers/setupBlockchainHelpers'
import BlockchainHandler from '../../../data-iframe/blockchainHandler/BlockchainHandler'

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

describe('Mailbox - purchaseKey', () => {
  let constants: ConstantsType
  let win: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  let fakeWindow: FakeWindow
  let mailbox: Mailbox
  let defaults: MailboxTestDefaults
  const testingData: BlockchainData = {
    locks: {
      [lockAddresses[0]]: {
        name: 'lock 1',
        address: lockAddresses[0],
        keyPrice: '1',
        expirationDuration: 5,
        currencyContractAddress: null,
        key: {
          expiration: 0,
          status: 'none',
          confirmations: 0,
          owner: addresses[1],
          transactions: [],
          lock: lockAddresses[0],
        },
      },
    },
    account: addresses[1],
    balance: {
      eth: '123',
    },
    network: 1,
    keys: {},
    transactions: {},
  }

  const purchaseRequest: PurchaseKeyRequest = {
    lock: lockAddresses[0],
    extraTip: '0',
  }

  // lock addresses must be normalized
  const malFormedPurchaseRequest_normalized = {
    lock: addresses[0],
    extraTip: '0',
  }

  const fakeHandler: Pick<BlockchainHandler, 'purchaseKey'> = {
    purchaseKey: jest.fn(),
  }

  function testingMailbox(): any {
    return mailbox as any
  }

  function setupDefaults(receiveData: boolean = false) {
    defaults = setupTestDefaults()
    constants = defaults.constants
    win = defaults.fakeWindow
    fakeWindow = win as FakeWindow
    mailbox = new Mailbox(constants, fakeWindow)

    fakeWindow.clearPostMessageMock()
    if (!receiveData) return

    testingMailbox().blockchainData = testingData
  }

  function expectPurchaseKey() {
    if (!testingMailbox().handler) {
      return expect(jest.fn()) // it has not been called, so return a dummy mock function
    }
    return expect(testingMailbox().handler.purchaseKey)
  }

  async function expectErrorsEmitted(error: string) {
    await fakeWindow.waitForPostMessage()
    return fakeWindow.expectPostMessageSent(PostMessages.ERROR, error)
  }

  function expectNoErrors() {
    expect(fakeWindow.parent.postMessage).not.toHaveBeenCalled()
  }

  describe('loading state', () => {
    beforeEach(() => {
      setupDefaults(true)
    })

    it('should not do anything when the BlockchainHandler is not ready', async () => {
      expect.assertions(2)

      delete testingMailbox().handler
      await mailbox.purchaseKey(purchaseRequest)

      expectPurchaseKey().not.toHaveBeenCalled()
      expectNoErrors()
    })

    it('should not do anything when the BlockchainHandler has not sent data yet', async () => {
      expect.assertions(2)

      testingMailbox().handler = fakeHandler
      delete testingMailbox().blockchainData
      await mailbox.purchaseKey(purchaseRequest)

      expectPurchaseKey().not.toHaveBeenCalled()
      expectNoErrors()
    })
  })

  describe('chain data fully loaded and ready', () => {
    beforeEach(() => {
      setupDefaults()
      testingMailbox().handler = fakeHandler
    })

    describe('errors', () => {
      beforeEach(() => {
        setupDefaults()
        testingMailbox().handler = fakeHandler
        testingMailbox().blockchainData = testingData
      })

      describe('malformed purchase request', () => {
        type TestingRequest = [string, any]
        type Requests = TestingRequest[]
        it.each(<Requests>[
          ['5', 5],
          ['request is falsy', false],
          ['null', null],
          ['no lock field', { extraTip: '0' }],
          ['no extraTip field', { lock: lockAddresses[1] }],
          ['lock is invalid format', { lock: 5, extraTip: '0' }],
          ["''", ''],
          ['lock not normalized', malFormedPurchaseRequest_normalized],
        ])(
          'should error if the request is invalid "%s"',
          async (_, request) => {
            expect.assertions(2)

            await mailbox.purchaseKey(request)

            await expectErrorsEmitted('Cannot purchase, malformed request')
            expectPurchaseKey().not.toHaveBeenCalled()
          }
        )
      })

      it('should error on unknown lock', async () => {
        expect.assertions(2)

        await mailbox.purchaseKey({
          lock: lockAddresses[2], // this address is not stored in "data"
          extraTip: '0',
        })

        await expectErrorsEmitted(
          `Cannot purchase key on unknown lock: "${lockAddresses[2]}"`
        )
        expectPurchaseKey().not.toHaveBeenCalled()
      })
    })

    describe('valid purchase requests', () => {
      beforeEach(() => {
        setupDefaults()
        testingMailbox().handler = fakeHandler
        testingMailbox().blockchainData = testingData
      })

      it('should pass the correct values to handler.purchaseKey', async () => {
        expect.assertions(1)

        const lock = testingData.locks[lockAddresses[0]]
        await mailbox.purchaseKey({
          lock: lockAddresses[0],
          extraTip: '0',
        })

        expectPurchaseKey().toHaveBeenCalledWith({
          lockAddress: lock.address,
          amountToSend: lock.keyPrice,
          erc20Address: lock.currencyContractAddress,
        })
      })
    })
  })
})
