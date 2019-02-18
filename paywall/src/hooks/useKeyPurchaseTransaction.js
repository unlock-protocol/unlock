import { useState, useEffect, useReducer } from 'react'
import Web3Utils from 'web3-utils'

import LockContract from '../artifacts/contracts/PublicLock.json'
import useAccount from './web3/useAccount'
import useWeb3 from './web3/useWeb3'
import { TRANSACTION_TYPES } from '../constants'
import useWallet from './web3/useWallet'
import usePoll from './utils/usePoll'
import useConfig from './utils/useConfig'
import {
  makeGetTransactionInfo,
  makeTransactionPoll,
  sendNewKeyPurchaseTransaction,
} from './asyncActions/keyPurchaseTransactions'

export function handleTransactionUpdates(transaction, update) {
  const { type, info } = update
  // triggered on key purchase, prior to sending the transaction, after retrieving the hash
  if (type === 'new') {
    const { lock, account } = info
    return {
      ...transaction,
      lock,
      account,
      status: 'pending',
      type: TRANSACTION_TYPES.KEY_PURCHASE,
      confirmations: 0,
      asOf: Number.MAX_SAFE_INTEGER, // Assign the largest block number for sorting purposes
    }
  }
  // triggered when we get the transaction hash before the transaction is sent to the miners
  if (type === 'hash') {
    const { hash } = info
    return { ...transaction, hash }
  }
  // triggered when the transaction has been sent and we are waiting for miners to put it into blocks
  if (type === 'start') {
    const { to, abi, asOf } = info
    if (transaction.asof === asOf) return transaction
    return { ...transaction, to, abi, asOf, confirmations: 0 }
  }
  // transaction has been mined, is on the chain, and a new block has been mined
  if (type === 'mined') {
    const { blockNumber, requiredConfirmations } = info
    const confirmations = blockNumber - transaction.asOf
    return {
      ...transaction,
      status: confirmations < requiredConfirmations ? 'confirming' : 'mined',
      confirmations,
    }
  }
  // transaction receipt showed the transaction was not propagated for some error
  if (type === 'failed') {
    return {
      ...transaction,
      status: 'failed',
    }
  }
  return transaction
}

export default function useKeyPurchaseTransaction(window, lock) {
  const web3 = useWeb3()
  const wallet = useWallet()
  const [error, setError] = useState()
  const { blockTime, requiredConfirmations } = useConfig()
  const [transaction, updateTransaction] = useReducer(
    handleTransactionUpdates,
    { status: 'inactive', confirmations: 0 }
  )
  const transactionHash = transaction.hash
  const { account } = useAccount(window)

  // transaction reducer action creators
  const setHash = hash => updateTransaction({ type: 'hash', info: { hash } })
  const newTransaction = () =>
    updateTransaction({ type: 'new', info: { lock: lock.address, account } })
  const startTransaction = (to, abi, asOf) =>
    updateTransaction({ type: 'start', info: { to, abi, asOf } })
  const mineTransaction = blockNumber =>
    updateTransaction({
      type: 'mined',
      info: { blockNumber, requiredConfirmations },
    })
  const failTransaction = () => updateTransaction({ type: 'fail' })

  const purchaseKey = () => {
    if (!lock || !account || transaction.status !== 'inactive') return
    // when we enable transfer of existing keys, data will be the existing key's data
    const data = ''
    const lockContract = new wallet.eth.Contract(LockContract.abi, lock.address)
    const abi = lockContract.methods
      // when we enable transfer of existing keys, the account will be the existing key's owner
      .purchaseFor(account, Web3Utils.utf8ToHex(data || ''))
      .encodeABI()
    sendNewKeyPurchaseTransaction({
      wallet,
      to: lock.address,
      from: account,
      data: abi,
      gas: 1000000,
      value: Web3Utils.toWei(lock.keyPrice, 'ether'),
      contract: LockContract,
      newTransaction,
      setHash,
      setError,
    })
  }

  const getTransactionInfo = makeGetTransactionInfo({
    web3,
    transactionHash,
    newTransaction,
    startTransaction,
    mineTransaction,
    failTransaction,
  })

  const transactionPoll = makeTransactionPoll({
    transaction,
    requiredConfirmations,
    getTransactionInfo,
  })

  usePoll(transactionPoll, blockTime / 2)

  useEffect(
    () => {
      if (!transactionHash || !web3) return
      getTransactionInfo()
    },
    [web3, transactionHash]
  )

  if (error) throw error

  // updateTransaction is returned strictly for testing purposes
  return { purchaseKey, transaction, updateTransaction }
}
