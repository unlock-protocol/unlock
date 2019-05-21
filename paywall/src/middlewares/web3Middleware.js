/* eslint promise/prefer-await-to-then: 0 */

import { LOCATION_CHANGE } from 'connected-react-router'
import { Web3Service } from '@unlock-protocol/unlock-js'

import { ADD_LOCK, UPDATE_LOCK, addLock, updateLock } from '../actions/lock'
import { updateKey, addKey } from '../actions/key'
import { updateAccount, SET_ACCOUNT } from '../actions/accounts'
import { setError } from '../actions/error'
import {
  addTransaction,
  updateTransaction,
  ADD_TRANSACTION,
  NEW_TRANSACTION,
  UPDATE_TRANSACTION,
} from '../actions/transaction'

import { lockRoute } from '../utils/routes'

import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

// This middleware listen to redux events and invokes the web3Service API.
// It also listen to events from web3Service and dispatches corresponding actions
const web3Middleware = config => ({ getState, dispatch }) => {
  const {
    readOnlyProvider,
    unlockAddress,
    blockTime,
    requiredConfirmations,
  } = config

  const web3Service = new Web3Service({
    readOnlyProvider,
    unlockAddress,
    blockTime,
    requiredConfirmations,
  })

  web3Service.on('account.updated', (account, update) => {
    dispatch(updateAccount(update))
  })

  /**
   * The Lock was changed.
   * Should we get the balance of the lock owner?
   */
  web3Service.on('lock.updated', (address, update) => {
    const lock = getState().locks[address]
    if (lock) {
      // Only dispatch the updates which are more recent than the current value
      if (!lock.asOf || lock.asOf < update.asOf) {
        dispatch(updateLock(lock.address, update))
      }
    } else {
      dispatch(addLock(address, update))
    }
  })

  /**
   * When a key was saved, we reload the corresponding lock because
   * it might have been updated (balance, outstanding keys...)
   */
  web3Service.on('key.saved', (keyId, key) => {
    const { account } = getState()
    web3Service.getLock(key.lock)
    if (account && account.address === key.owner) {
      web3Service.refreshAccountBalance(getState().account)
    }
    web3Service.getKeyByLockForOwner(key.lock, key.owner)
  })

  web3Service.on('key.updated', (id, update) => {
    if (getState().keys[id]) {
      dispatch(updateKey(id, update))
    } else {
      // That key does not exist yet
      dispatch(addKey(id, update))
    }
  })

  web3Service.on('transaction.updated', (transactionHash, update) => {
    const transaction = getState().transactions[transactionHash]
    dispatch(
      updateTransaction(transactionHash, {
        ...(transaction ? transaction : {}),
        ...update,
      })
    )
  })

  web3Service.on('transaction.new', transactionHash => {
    dispatch(
      addTransaction({
        hash: transactionHash,
        network: getState().network.name,
      })
    )
  })

  web3Service.on('error', error => {
    dispatch(setError(error.message))
  })

  return function(next) {
    return function(action) {
      if (action.type === ADD_TRANSACTION) {
        if (action.transaction.input) {
          // we only pass the transaction defaults if input is set, otherwise
          // parsing of input will crash
          web3Service.getTransaction(
            action.transaction.hash,
            action.transaction
          )
        } else {
          web3Service.getTransaction(action.transaction.hash)
        }
      }

      if (action.type === NEW_TRANSACTION) {
        web3Service.getTransaction(action.transaction.hash, action.transaction)
      }

      next(action)

      const {
        account,
        router: {
          location: { pathname, hash },
        },
        locks,
      } = getState()
      const { lockAddress, transaction } = lockRoute(pathname + hash)
      const accountAddress = account && account.address
      if (
        [SET_PROVIDER, SET_NETWORK, SET_ACCOUNT, LOCATION_CHANGE].includes(
          action.type
        )
      ) {
        if (transaction) {
          dispatch(
            addTransaction({
              hash: transaction,
              network: getState().network.name,
            })
          )
        }
      }

      if (action.type === SET_PROVIDER || action.type === SET_NETWORK) {
        // for both of these actions, the lock state is invalid, and must be refreshed.
        if (lockAddress) {
          web3Service.getLock(lockAddress)
        }
      }

      // note: this needs to be after the reducer has seen it, because refreshAccountBalance
      // triggers 'account.update' which dispatches UPDATE_ACCOUNT. The reducer assumes that
      // SET_ACCOUNT has reached it first, and throws an exception. Putting it after the
      // reducer has a chance to populate state removes this race condition.
      if (action.type === SET_ACCOUNT) {
        // TODO: when the account has been updated we should reset web3Service and remove all listeners
        // So that pending API calls do not interract with our "new" state.
        web3Service.refreshAccountBalance(action.account)

        if (lockAddress) {
          web3Service.getKeyByLockForOwner(lockAddress, action.account.address)
        }
      }

      if (action.type === ADD_LOCK || action.type == UPDATE_LOCK) {
        const lock = locks[action.address]
        // this is quite different from the code on line 160, as it uses the lock from the action
        // line 160 uses the lock from the current URL
        if (account) {
          web3Service.getKeyByLockForOwner(lock.address, account.address)
        }
      } else if (
        action.type === LOCATION_CHANGE &&
        action.payload.location &&
        action.payload.location.pathname
      ) {
        // Location was changed, get the matching lock
        if (lockAddress) {
          web3Service.getLock(lockAddress)
        }
      }

      const keyId = `${lockAddress}-${accountAddress}`
      if (action.type === NEW_TRANSACTION) {
        // when the web3Service is retrieving transactions, only transactionHash is set
        // this line checks to see if we are instead getting the transaction with all the stuff we need
        if (
          action.transaction.to === lockAddress &&
          action.transaction.from === accountAddress
        ) {
          // this is key purchase transaction from us to the lock!
          const key = getState().keys[keyId]

          dispatch(
            updateKey(keyId, {
              ...key,
              transactions: {
                ...key.transactions,
                [action.transaction.hash]: action.transaction,
              },
            })
          )
        }
      }
      if (action.type === UPDATE_TRANSACTION) {
        const existingTransaction = getState().transactions[action.hash]
        if (
          (existingTransaction.to === lockAddress &&
            existingTransaction.from === accountAddress) ||
          existingTransaction.key === keyId
        ) {
          // this is key purchase transaction from us to the lock!
          const key = getState().keys[keyId]

          if (key) {
            dispatch(
              updateKey(keyId, {
                ...key,
                transactions: {
                  ...key.transactions,
                  [action.hash]: existingTransaction,
                },
              })
            )
          } else {
            dispatch(
              addKey(keyId, {
                lock: lockAddress,
                owner: accountAddress,
                expiration: 0,
                data: null,
                id: keyId,
                transactions: {
                  [action.hash]: existingTransaction,
                },
              })
            )
          }
        }
      }
    }
  }
}

export default web3Middleware
