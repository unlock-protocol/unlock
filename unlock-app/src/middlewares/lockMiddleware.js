/* eslint no-console: 0 */ // TODO: remove me when this is clean

import React from 'react'
import { LOCATION_CHANGE } from 'react-router-redux'
import {
  ADD_LOCK,
  CREATE_LOCK,
  WITHDRAW_FROM_LOCK,
  UPDATE_LOCK,
  addLock,
  lockDeployed,
  updateLock,
} from '../actions/lock'
import { PURCHASE_KEY, updateKey, addKey } from '../actions/key'
import { setAccount, updateAccount, SET_ACCOUNT } from '../actions/accounts'
import { setNetwork, SET_NETWORK } from '../actions/network'
import { setError } from '../actions/error'
import { SET_PROVIDER } from '../actions/provider'
import { addTransaction, updateTransaction } from '../actions/transaction'
import { LOCK_PATH_NAME_REGEXP } from '../constants'

import Web3Service from '../services/web3Service'

// This middleware listen to redux events and invokes the services APIs.
// It also listen to events from web3Service and dispatches corresponding actions
// TODO: consider if on events we should only trigger more actions instead of calling web3Service directly
export default function lockMiddleware({ getState, dispatch }) {
  // Buffer of actions waiting for connection
  const actions = []

  const web3Service = new Web3Service()

  /**
   * When an account was changed, we dispatch the corresponding action
   * TODO: consider cleaning up state when the account is a different one
   */
  web3Service.on('account.changed', account => {
    dispatch(setAccount(account))
    web3Service.getPastUnlockTransactionsForUser(account.address)
  })

  web3Service.on('account.updated', (account, update) => {
    dispatch(updateAccount(update))
  })

  /**
   * When a lock was saved, we update it, as well as its transaction and
   * refresh the balance of its owner and refresh its content
   */
  web3Service.on('lock.saved', (lock, address) => {
    dispatch(lockDeployed(lock, address))
    dispatch(
      updateTransaction(lock.transaction, {
        lock: address,
      })
    )
    web3Service.refreshAccountBalance(getState().account)
    web3Service.getLock(address)
  })

  /**
   * The Lock was changed.
   * Should we get the balance of the lock owner?
   */
  web3Service.on('lock.updated', (address, update) => {
    const lock = getState().locks[address]
    if (lock) {
      dispatch(updateLock(lock.address, update))
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
    web3Service.refreshAccountBalance(key.owner)
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

  web3Service.on('transaction.new', transaction => {
    dispatch(addTransaction(transaction))
  })

  web3Service.on('transaction.updated', (transaction, update) => {
    dispatch(updateTransaction(transaction.hash, update))
  })

  web3Service.on('error', error => {
    dispatch(setError(<p>{error.message}</p>))
  })

  /**
   * When the network has changed, we need to get a new account
   * as well as reset all the reducers
   */
  web3Service.on('network.changed', networkId => {
    if (getState().network.name !== networkId) {
      // Set the new network, which should also clean up all reducers
      // And we need a new account!
      dispatch(setNetwork(networkId))
      return web3Service.refreshOrGetAccount()
    }
  })

  /**
   * This is invoked when the web3Service is ready. We can then (re)trigger all past actions.
   */
  web3Service.on('ready', () => {
    while (actions.length > 0) {
      let action = actions.shift()
      dispatch(action)
    }
  })

  return function(next) {
    return function(action) {
      if (
        !web3Service.ready &&
        [SET_NETWORK, SET_ACCOUNT].indexOf(action.type) == -1
      ) {
        // As long as middleware is not ready
        // we store the action
        actions.push(action)
        return web3Service.connect({ provider: getState().provider })
      } else if (action.type === SET_PROVIDER) {
        web3Service.connect({ provider: action.provider })
      } else if (action.type === CREATE_LOCK) {
        web3Service.createLock(action.lock, getState().account)
      } else if (action.type === PURCHASE_KEY) {
        const account = getState().account
        const lock = Object.values(getState().locks).find(
          lock => lock.address === action.key.lock
        )
        web3Service.purchaseKey(
          action.key.lock,
          action.key.owner,
          lock.keyPrice,
          account,
          action.key.data
        )
      } else if (action.type === WITHDRAW_FROM_LOCK) {
        const account = getState().account
        web3Service.withdrawFromLock(action.lock, account)
      }

      next(action)

      if (action.type === ADD_LOCK || action.type == UPDATE_LOCK) {
        const lock = getState().locks[action.address]
        if (!lock.pending) {
          web3Service.getKeyByLockForOwner(
            lock.address,
            getState().account.address
          )
        }
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
