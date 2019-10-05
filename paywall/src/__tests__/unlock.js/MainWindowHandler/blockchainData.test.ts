import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'
import {
  BlockchainData,
  KeyResults,
} from '../../../data-iframe/blockchainHandler/blockChainTypes'
import {
  Locks,
  Transactions,
  TransactionStatus,
  TransactionType,
} from '../../../unlockTypes'
import { PostMessages } from '../../../messageTypes'

const defaultState: BlockchainData = {
  account: null,
  balance: {},
  keys: {},
  locks: {},
  network: 1,
  transactions: {},
}

describe('MainWindowHandler - blockchainData', () => {
  let fakeWindow: FakeWindow
  let iframes: IframeHandler
  let handler: MainWindowHandler

  function getBlockchainData() {
    return (fakeWindow as any).unlockProtocol.blockchainData()
  }

  beforeAll(() => {
    fakeWindow = new FakeWindow()
    iframes = new IframeHandler(fakeWindow, 'http://t', 'http://u', 'http://v')
    handler = new MainWindowHandler(fakeWindow, iframes)
    handler.init()
  })

  it('should have empty state before any messages are received', () => {
    expect.assertions(1)

    expect(getBlockchainData()).toEqual(defaultState)
  })

  describe('handling messages', () => {
    // These tests are stateful, this way we test that updates don't wipe out
    // unrelated state
    const accountAddress = '0xdeadbeef'
    const keys: KeyResults = {
      '0x123abc': {
        lock: '0x123abc',
        expiration: Date.now(),
        owner: accountAddress,
      },
    }
    const locks: Locks = {
      '0x123abc': {
        name: 'Rupert',
        address: '0x123abc',
        keyPrice: '2.3',
        expirationDuration: 1010101013,
        key: {
          ...keys['0x123abc'],
          transactions: [],
          status: 'confirmed',
          confirmations: 1337,
        },
        currencyContractAddress: '',
      },
    }
    const balance = {
      WEENUS: '1550',
    }
    const network = 1984
    const transactions: Transactions = {
      '0xC0FFEE': {
        status: TransactionStatus.MINED,
        confirmations: 15,
        hash: '0xC0FFEE',
        type: TransactionType.KEY_PURCHASE,
        blockNumber: 143566669,
      },
    }

    it('should store locks in response to UPDATE_LOCKS', () => {
      expect.assertions(1)

      iframes.data.emit(PostMessages.UPDATE_LOCKS, locks)

      expect(getBlockchainData()).toEqual({
        ...defaultState,
        locks,
      })
    })

    it('should store account address in response to UPDATE_ACCOUNT', () => {
      expect.assertions(1)

      iframes.data.emit(PostMessages.UPDATE_ACCOUNT, accountAddress)

      expect(getBlockchainData()).toEqual({
        ...defaultState,
        locks,
        account: accountAddress,
      })
    })

    it('should store account balance in response to UPDATE_ACCOUNT_BALANCE', () => {
      expect.assertions(1)

      iframes.data.emit(PostMessages.UPDATE_ACCOUNT_BALANCE, balance)

      expect(getBlockchainData()).toEqual({
        ...defaultState,
        locks,
        account: accountAddress,
        balance,
      })
    })

    it('should store current network in response to UPDATE_NETWORK', () => {
      expect.assertions(1)

      iframes.data.emit(PostMessages.UPDATE_NETWORK, network)

      expect(getBlockchainData()).toEqual({
        ...defaultState,
        locks,
        account: accountAddress,
        balance,
        network,
      })
    })

    it('should store keys in response to UPDATE_KEYS', () => {
      expect.assertions(1)

      iframes.data.emit(PostMessages.UPDATE_KEYS, keys)

      expect(getBlockchainData()).toEqual({
        ...defaultState,
        locks,
        account: accountAddress,
        balance,
        network,
        keys,
      })
    })

    it('should store transactions in response to UPDATE_TRANSACTIONS', () => {
      expect.assertions(1)

      iframes.data.emit(PostMessages.UPDATE_TRANSACTIONS, transactions)

      expect(getBlockchainData()).toEqual({
        ...defaultState,
        locks,
        account: accountAddress,
        balance,
        network,
        keys,
        transactions,
      })
    })
  })
})
