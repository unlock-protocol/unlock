import { IframePostOfficeWindow } from '../../../windowTypes'
import {
  ConstantsType,
  FetchWindow,
  SetTimeoutWindow,
  WalletServiceType,
  Web3ServiceType,
  BlockchainData,
} from '../../../data-iframe/blockchainHandler/blockChainTypes'
import { Locks, TransactionType, TransactionStatus } from '../../../unlockTypes'
import Mailbox from '../../../data-iframe/Mailbox'
import {
  setupTestDefaults,
  MailboxTestDefaults,
} from '../../test-helpers/setupMailboxHelpers'
import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import {
  addresses,
  getWalletService,
  getWeb3Service,
  lockAddresses,
  firstLockLocked,
  firstLockSubmitted,
  secondLockLocked,
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

describe('Mailbox - getUnlockedLockAddresses', () => {
  let constants: ConstantsType
  let win: FetchWindow & SetTimeoutWindow & IframePostOfficeWindow
  let fakeWindow: FakeWindow
  let mailbox: Mailbox
  let defaults: MailboxTestDefaults

  const account = addresses[1]

  // all locks have had their addresses normalized before arriving
  const lockedLocks: Locks = {
    [lockAddresses[0]]: firstLockLocked,
    [lockAddresses[1]]: secondLockLocked,
  }

  const submittedLocks: Locks = {
    [lockAddresses[0]]: firstLockSubmitted,
  }

  const pendingLocks: Locks = {
    [lockAddresses[0]]: {
      ...lockedLocks[lockAddresses[0]],
      key: {
        ...lockedLocks[lockAddresses[0]].key,
        status: 'pending',
        transactions: [
          {
            status: TransactionStatus.PENDING,
            confirmations: 0,
            hash: 'hash',
            type: TransactionType.KEY_PURCHASE,
            blockNumber: Number.MAX_SAFE_INTEGER,
          },
        ],
      },
    },
  }

  const validLocks: Locks = {
    [lockAddresses[0]]: {
      ...lockedLocks[lockAddresses[0]],
      key: {
        ...lockedLocks[lockAddresses[0]].key,
        status: 'valid',
        expiration: 12345,
        transactions: [
          {
            status: TransactionStatus.PENDING,
            confirmations: 617234,
            hash: 'hash',
            type: TransactionType.KEY_PURCHASE,
            blockNumber: 123,
          },
        ],
      },
    },
  }

  function testingMailbox(): any {
    return mailbox as any
  }

  function setupDefaults(locks: Locks = {}) {
    defaults = setupTestDefaults()
    constants = defaults.constants
    win = defaults.fakeWindow
    fakeWindow = win as FakeWindow
    mailbox = new Mailbox(constants, fakeWindow)

    const testingData: BlockchainData = {
      locks,
      account,
      balance: '0',
      network: 1,
      keys: {},
      transactions: {},
    }
    testingMailbox().blockchainData = testingData
  }

  it('should return [] if the BlockchainHandler has not yet sent any data', () => {
    expect.assertions(1)

    setupDefaults()

    delete testingMailbox().blockchainData

    expect(mailbox.getUnlockedLockAddresses()).toEqual([])
  })

  it('should return [] if the blockchain data does not yet have any locks', () => {
    expect.assertions(1)

    setupDefaults()

    expect(mailbox.getUnlockedLockAddresses()).toEqual([])
  })

  it('should return [] if none of the lock keys returned are valid or in process of key purchase', () => {
    expect.assertions(1)

    setupDefaults(lockedLocks)

    expect(mailbox.getUnlockedLockAddresses()).toEqual([])
  })

  it('should return an array containing the unlocked lock addresses for submitted purchases', () => {
    expect.assertions(1)

    setupDefaults(submittedLocks)

    expect(mailbox.getUnlockedLockAddresses()).toEqual([lockAddresses[0]])
  })

  it('should return an array containing the unlocked lock addresses for pending purchases', () => {
    expect.assertions(1)

    setupDefaults(pendingLocks)

    expect(mailbox.getUnlockedLockAddresses()).toEqual([lockAddresses[0]])
  })

  it('should return an array containing the unlocked lock addresses for valid purchases', () => {
    expect.assertions(1)

    setupDefaults(validLocks)

    expect(mailbox.getUnlockedLockAddresses()).toEqual([lockAddresses[0]])
  })
})
