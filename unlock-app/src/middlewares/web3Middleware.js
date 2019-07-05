/* eslint promise/prefer-await-to-then: 0 */

import { Web3Service } from '@unlock-protocol/unlock-js'
import {
  CREATE_LOCK,
  GET_LOCK,
  addLock,
  updateLock,
  createLock,
} from '../actions/lock'

import { startLoading, doneLoading } from '../actions/loading'
import { updateKey, addKey } from '../actions/key'
import { updateAccount, SET_ACCOUNT } from '../actions/accounts'
import { setError } from '../actions/error'
import {
  addTransaction,
  updateTransaction,
  ADD_TRANSACTION,
  NEW_TRANSACTION,
} from '../actions/transaction'
import { PGN_ITEMS_PER_PAGE, UNLIMITED_KEYS_COUNT } from '../constants'

import {
  SET_KEYS_ON_PAGE_FOR_LOCK,
  setKeysOnPageForLock,
} from '../actions/keysPages'
import { transactionTypeMapping } from '../utils/types'
import { Web3 } from '../utils/Error'

// This middleware listen to redux events and invokes the web3Service API.
// It also listen to events from web3Service and dispatches corresponding actions
const web3Middleware = config => {
  const {
    readOnlyProvider,
    unlockAddress,
    blockTime,
    requiredConfirmations,
  } = config
  return ({ getState, dispatch }) => {
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

      // Our app defines a unlimitedKeys boolean
      if (update.maxNumberOfKeys) {
        update.unlimitedKeys = update.maxNumberOfKeys === UNLIMITED_KEYS_COUNT
      }

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
      web3Service.getLock(key.lock)
      if (getState().account.address === key.owner) {
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
      // Mapping the transaction type
      if (update.type) {
        update.type = transactionTypeMapping(update.type)
      }
      dispatch(updateTransaction(transactionHash, update))
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
      const { message } = error
      // TODO: better handling of these errors? We can't separate them
      // by level right now, so they're all diagnostic.
      dispatch(setError(Web3.Diagnostic(message)))
    })

    web3Service.on('keys.page', (lock, page, keys) => {
      dispatch(setKeysOnPageForLock(page, lock, keys))
    })

    return function(next) {
      return function(action) {
        // When the keys for a lock are loaded on the dashboard
        if (action.type === SET_KEYS_ON_PAGE_FOR_LOCK) {
          if (!action.keys) {
            web3Service.getKeysForLockOnPage(
              action.lock,
              action.page,
              PGN_ITEMS_PER_PAGE
            )
          }
        }

        if (action.type === ADD_TRANSACTION) {
          dispatch(startLoading())
          web3Service
            .getTransaction(action.transaction.hash, action.transaction)
            .then(() => {
              dispatch(doneLoading())
            })
        }

        if (action.type === NEW_TRANSACTION) {
          dispatch(startLoading())
          web3Service
            .getTransaction(action.transaction.hash, action.transaction)
            .then(() => {
              dispatch(doneLoading())
            })
        }

        if (action.type === CREATE_LOCK && !action.lock.address) {
          web3Service.generateLockAddress().then(address => {
            action.lock.address = address
            dispatch(createLock(action.lock))
          })
        }

        if (action.type === GET_LOCK) {
          web3Service.getLock(action.address)
        }

        next(action)

        // note: this needs to be after the reducer has seen it, because refreshAccountBalance
        // triggers 'account.update' which dispatches UPDATE_ACCOUNT. The reducer assumes that
        // ADD_ACCOUNT has reached it first, and throws an exception. Putting it after the
        // reducer has a chance to populate state removes this race condition.
        if (action.type === SET_ACCOUNT) {
          // TODO: when the account has been updated we should reset web3Service and remove all listeners
          // So that pending API calls do not interract with our "new" state.
          web3Service.refreshAccountBalance(action.account)
          dispatch(startLoading())
          web3Service
            .getPastLockCreationsTransactionsForUser(action.account.address)
            .then(lockCreations => {
              dispatch(doneLoading())
              lockCreations.forEach(lockCreation => {
                web3Service.getTransaction(lockCreation.transactionHash, {
                  network: getState().network.name,
                })
              })
            })
        }
      }
    }
  }
}

export default web3Middleware
