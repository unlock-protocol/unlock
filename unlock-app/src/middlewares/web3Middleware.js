/* eslint no-console: 0 */ // TODO: remove me when this is clean

import { LOCATION_CHANGE } from 'react-router-redux'
import { ADD_LOCK, UPDATE_LOCK, addLock, updateLock } from '../actions/lock'
import { updateKey, addKey } from '../actions/key'
import { updateAccount, SET_ACCOUNT } from '../actions/accounts'
import { setError } from '../actions/error'
import {
  addTransaction,
  updateTransaction,
  ADD_TRANSACTION,
} from '../actions/transaction'
import { LOCK_PATH_NAME_REGEXP, PGN_ITEMS_PER_PAGE } from '../constants'

import Web3Service from '../services/web3Service'
import {
  SET_KEYS_ON_PAGE_FOR_LOCK,
  setKeysOnPageForLock,
} from '../actions/keysPages'

// This middleware listen to redux events and invokes the web3Service API.
// It also listen to events from web3Service and dispatches corresponding actions
export default function web3Middleware({ getState, dispatch }) {
  const web3Service = new Web3Service()

  web3Service.on('account.updated', (account, update) => {
    dispatch(updateAccount(update))
  })

  /**
   * When a lock was saved, we update it, as well as its transaction and
   * refresh the balance of its owner and refresh its content
   */
  web3Service.on('lock.saved', (lock, address) => {
    web3Service.refreshAccountBalance(getState().account)
    web3Service.getLock(address)
    web3Service.getPastLockTransactions(address) // This is costly and not useful for the paywall app...
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
    dispatch(updateTransaction(transactionHash, update))
  })

  web3Service.on('transaction.new', transactionHash => {
    dispatch(
      addTransaction({
        hash: transactionHash,
      })
    )
  })

  web3Service.on('error', error => {
    dispatch(setError(error.message))
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

      if (action.type === SET_ACCOUNT) {
        // TODO: when the account has been updated we should reset web3Service and remove all listeners
        // So that pending API calls do not interract with our "new" state.
        web3Service.refreshAccountBalance(action.account)
        web3Service.getPastUnlockTransactionsForUser(action.account.address)
      }

      if (action.type === ADD_TRANSACTION) {
        web3Service.getTransaction(action.transaction.hash)
      }

      next(action)

      if (action.type === ADD_LOCK || action.type == UPDATE_LOCK) {
        const lock = getState().locks[action.address]
        web3Service.getKeyByLockForOwner(
          lock.address,
          getState().account.address
        )
      } else if (
        action.type === LOCATION_CHANGE &&
        action.payload.location &&
        action.payload.location.pathname
      ) {
        // Location was changed, get the matching lock
        const match = action.payload.location.pathname.match(
          LOCK_PATH_NAME_REGEXP
        )
        if (match) {
          web3Service.getLock(match[1])
        }
      }
    }
  }
}
