import * as rtl from 'react-testing-library'
import React from 'react'

import useKeyPurchaseTransaction, {
  handleTransactionUpdates,
} from '../../hooks/useKeyPurchaseTransaction'
import { TRANSACTION_TYPES } from '../../constants'
import {
  makeGetTransactionInfo,
  makeTransactionPoll,
  sendNewKeyPurchaseTransaction,
} from '../../hooks/asyncActions/keyPurchaseTransactions'
import LockContract from '../../artifacts/contracts/PublicLock.json'
import { wrapperMaker, expectError } from './helpers'
import { WalletContext } from '../../hooks/components/Wallet'
import { ReadOnlyContext } from '../../hooks/components/Web3'
import useAccount from '../../hooks/web3/useAccount'
import usePoll from '../../hooks/utils/usePoll'

jest.mock('../../hooks/asyncActions/keyPurchaseTransactions')
jest.mock('../../hooks/web3/useAccount')
jest.mock('../../hooks/utils/usePoll')

describe('useKeyPurchaseTransaction hook', () => {
  describe('handleTransactionUpdates reducer', () => {
    let transaction
    const newAction = {
      type: 'new',
      info: { lock: 'lock', account: 'account' },
    }
    const hashAction = {
      type: 'hash',
      info: { hash: 'hash' },
    }
    const startAction = {
      type: 'start',
      info: {
        to: 'to',
        abi: 'abi',
        asOf: 5,
      },
    }
    const confirmingAction = {
      type: 'mined',
      info: {
        blockNumber: 7,
        requiredConfirmations: 3,
      },
    }
    const minedAction = {
      type: 'mined',
      info: {
        blockNumber: 7,
        requiredConfirmations: 2,
      },
    }
    const failedAction = {
      type: 'failed',
    }

    beforeEach(() => {
      transaction = {
        status: 'inactive',
      }
    })

    describe('individual reducers', () => {
      it('new', () => {
        expect(handleTransactionUpdates(transaction, newAction)).toEqual({
          lock: 'lock',
          account: 'account',
          status: 'pending',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          confirmations: 0,
          asOf: Number.MAX_SAFE_INTEGER,
        })
      })
      it('hash', () => {
        expect(handleTransactionUpdates(transaction, hashAction)).toEqual({
          status: 'inactive',
          hash: 'hash',
        })
      })
      it('start', () => {
        expect(handleTransactionUpdates(transaction, startAction)).toEqual({
          status: 'inactive',
          to: 'to',
          abi: 'abi',
          asOf: 5,
          confirmations: 0,
        })
      })
      it('confirming', () => {
        transaction.asOf = 5
        expect(handleTransactionUpdates(transaction, confirmingAction)).toEqual(
          {
            status: 'confirming',
            asOf: 5,
            confirmations: 2,
          }
        )
      })
      it('mined', () => {
        transaction.asOf = 5
        expect(handleTransactionUpdates(transaction, minedAction)).toEqual({
          status: 'mined',
          asOf: 5,
          confirmations: 2,
        })
      })
      it('failed', () => {
        expect(handleTransactionUpdates(transaction, failedAction)).toEqual({
          status: 'failed',
        })
      })
    })
    it('transaction flow', () => {
      transaction = handleTransactionUpdates(transaction, newAction)
      expect(transaction).toEqual({
        lock: 'lock',
        account: 'account',
        status: 'pending',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 0,
        asOf: Number.MAX_SAFE_INTEGER,
      })

      transaction = handleTransactionUpdates(transaction, hashAction)
      expect(transaction).toEqual({
        lock: 'lock',
        hash: 'hash',
        account: 'account',
        status: 'pending',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 0,
        asOf: Number.MAX_SAFE_INTEGER,
      })

      transaction = handleTransactionUpdates(transaction, startAction)
      expect(transaction).toEqual({
        lock: 'lock',
        to: 'to',
        abi: 'abi',
        asOf: 5,
        hash: 'hash',
        account: 'account',
        status: 'pending',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 0,
      })

      transaction = handleTransactionUpdates(transaction, minedAction)
      expect(transaction).toEqual({
        lock: 'lock',
        to: 'to',
        abi: 'abi',
        asOf: 5,
        hash: 'hash',
        account: 'account',
        status: 'mined',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 2,
      })

      transaction = handleTransactionUpdates(transaction, failedAction)
      expect(transaction).toEqual({
        lock: 'lock',
        to: 'to',
        abi: 'abi',
        asOf: 5,
        hash: 'hash',
        account: 'account',
        status: 'failed',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 2,
      })
    })
  })
  describe('useKeyPurchaseTransaction', () => {
    let config
    let fakeWindow
    let wallet
    let web3
    let InnerWrapper
    let getTransactionInfo
    let purchaseFor
    let encodeABI
    let transactionPoll
    const lock = {
      address: 'lockaddress',
      keyPrice: '0.01',
    }

    // wrapper to use with rtl's testHook
    // allows us to pass in the mock wallet
    // the InnerWrapper is pulled from the test helpers file
    // and includes passing in mock config and testing for errors
    // thrown in hooks
    function wrapper(props) {
      return (
        <ReadOnlyContext.Provider value={web3}>
          <WalletContext.Provider value={wallet}>
            <InnerWrapper {...props} />
          </WalletContext.Provider>
        </ReadOnlyContext.Provider>
      )
    }

    beforeEach(() => {
      getTransactionInfo = jest.fn()
      transactionPoll = jest.fn()
      makeGetTransactionInfo.mockImplementation(() => getTransactionInfo)
      makeTransactionPoll.mockImplementation(() => transactionPoll)
      config = { blockTime: 5, requiredConfirmations: 5 }
      InnerWrapper = wrapperMaker(config)

      useAccount.mockImplementation(() => ({ account: 'account' }))
      encodeABI = jest.fn(() => 'abi')
      purchaseFor = jest.fn(() => ({
        encodeABI,
      }))
      wallet = {
        eth: {
          Contract: () => ({
            methods: {
              purchaseFor,
            },
          }),
        },
      }
      web3 = 'web3'
      fakeWindow = {
        location: {
          pathname: '',
          hash: '',
        },
      }
    })
    describe('async function makers', () => {
      it('calls makeGetTransactionInfo', () => {
        rtl.testHook(() => useKeyPurchaseTransaction(fakeWindow, lock), {
          wrapper,
        })

        expect(makeGetTransactionInfo).toHaveBeenCalledWith({
          web3: 'web3',
          transactionHash: undefined,
          newTransaction: expect.any(Function),
          startTransaction: expect.any(Function),
          mineTransaction: expect.any(Function),
          failTransaction: expect.any(Function),
        })
      })
      it('calls makeTransactionPoll', () => {
        rtl.testHook(() => useKeyPurchaseTransaction(fakeWindow, lock), {
          wrapper,
        })

        expect(makeTransactionPoll).toHaveBeenCalledWith({
          transaction: { status: 'inactive', confirmations: 0 },
          requiredConfirmations: 5,
          getTransactionInfo,
        })
      })
    })
    describe('transaction polling', () => {
      it('calls usePoll with transactionPoll and 1/2 blockSize', () => {
        rtl.testHook(() => useKeyPurchaseTransaction(fakeWindow, lock), {
          wrapper,
        })

        expect(usePoll).toHaveBeenCalledWith(transactionPoll, 5 / 2)
      })
    })
    describe('getTransactionInfo', () => {
      it('does not call if there is no transaction hash', () => {
        rtl.testHook(() => useKeyPurchaseTransaction(fakeWindow, lock), {
          wrapper,
        })

        expect(getTransactionInfo).not.toHaveBeenCalled()
      })
      it('does not call if web3 is not ready', () => {
        web3 = false

        rtl.testHook(() => useKeyPurchaseTransaction(fakeWindow, lock), {
          wrapper,
        })

        expect(getTransactionInfo).not.toHaveBeenCalled()
      })
      it('calls getTransactionInfo', () => {
        const {
          result: {
            current: { updateTransaction },
          },
        } = rtl.testHook(() => useKeyPurchaseTransaction(fakeWindow, lock), {
          wrapper,
        })

        rtl.act(() => {
          updateTransaction({
            type: 'hash',
            info: {
              hash: 'hash',
            },
          })
        })

        expect(getTransactionInfo).toHaveBeenCalled()
      })
    })
    describe('purchaseKey', () => {
      it('does nothing if lock is not set', () => {
        const {
          result: {
            current: { purchaseKey },
          },
        } = rtl.testHook(
          () => useKeyPurchaseTransaction(fakeWindow, undefined),
          {
            wrapper,
          }
        )

        rtl.act(() => {
          purchaseKey()
        })

        expect(sendNewKeyPurchaseTransaction).not.toHaveBeenCalled()
      })
      it('does nothing if account is not set', () => {
        useAccount.mockImplementation(() => ({ account: undefined }))

        const {
          result: {
            current: { purchaseKey },
          },
        } = rtl.testHook(() => useKeyPurchaseTransaction(fakeWindow, lock), {
          wrapper,
        })

        rtl.act(() => {
          purchaseKey()
        })

        expect(sendNewKeyPurchaseTransaction).not.toHaveBeenCalled()
      })
      it('calls sendNewKeyPurchaseTransaction', () => {
        const {
          result: {
            current: { purchaseKey },
          },
        } = rtl.testHook(() => useKeyPurchaseTransaction(fakeWindow, lock), {
          wrapper,
        })

        rtl.act(() => {
          purchaseKey()
        })

        expect(sendNewKeyPurchaseTransaction).toHaveBeenCalledWith({
          contract: LockContract,
          wallet,
          to: 'lockaddress',
          from: 'account',
          data: 'abi',
          gas: 1000000,
          value: '10000000000000000',
          newTransaction: expect.any(Function),
          setHash: expect.any(Function),
          setError: expect.any(Function),
        })
      })
    })
    describe('errors', () => {
      it('if an error occurs, it throws', () => {
        sendNewKeyPurchaseTransaction.mockImplementationOnce(({ setError }) => {
          setError(new Error('nope'))
        })

        expectError(
          () =>
            rtl.act(() => {
              const {
                result: {
                  current: { purchaseKey },
                },
              } = rtl.testHook(
                () => useKeyPurchaseTransaction(fakeWindow, lock),
                {
                  wrapper,
                }
              )
              purchaseKey()
            }),
          'nope'
        )
      })
    })
  })
})
