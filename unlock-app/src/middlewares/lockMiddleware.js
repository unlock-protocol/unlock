/* eslint no-console: 0 */ // TODO: remove me when this is clean

import React from 'react'
import { LOCATION_CHANGE } from 'react-router-redux'
import {
  CREATE_LOCK,
  SET_LOCK,
  WITHDRAW_FROM_LOCK,
  resetLock,
} from '../actions/lock'
import { PURCHASE_KEY } from '../actions/key'
import { SET_ACCOUNT, setAccount } from '../actions/accounts'
import { setNetwork } from '../actions/network'
import { setError } from '../actions/error'
import { SET_PROVIDER } from '../actions/provider'
import { addTransaction, updateTransaction } from '../actions/transaction'

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
  })

  /**
   * When a lock was saved, we refresh the balance of its owner
   */
  web3Service.on('lock.saved', lock => {
    dispatch(resetLock(lock))
    web3Service.refreshOrGetAccount(getState().account)
  })

  /**
   * The Lock was changed.
   * Should we get the balance of the lock owner?
   */
  web3Service.on('lock.updated', lock => {
    dispatch(resetLock(lock))
  })

  /**
   * When a key was saved, we refresh the balance of the lock
   * and the balance of the account!
   */
  web3Service.on('key.saved', key => {
    web3Service.getLock(getState().locks[key.lock])
    web3Service.refreshOrGetAccount(getState().account)
  })

  /**
   * When a key was updated, we reload the corresponding lock because
   * it might have been updated (balance, outstanding keys...)
   */
  web3Service.on('key.updated', key => {
    web3Service.getLock(getState().locks[key.lock])
  })

  web3Service.on('transaction.new', transaction => {
    dispatch(addTransaction(transaction))
  })

  web3Service.on('transaction.updated', transaction => {
    dispatch(updateTransaction(transaction))
  })

  web3Service.on('error', error => {
    dispatch(setError(<p>{error.message}</p>))
  })

  /**
   * When the network has changed, we may need to refresh state or clean it
   */
  web3Service.on('network.changed', networkId => {
    // retrigger all actions buffered. Not sure this is actually required though.
    while (actions.length > 0) {
      let action = actions.shift()
      dispatch(action)
    }
    if (getState().network.name !== networkId) {
      // Set the new network, which should also clean up all reducers
      dispatch(setNetwork(networkId))
      // So we need a new account!
      return web3Service.refreshOrGetAccount()
    } else {
      // The network is the same, so let's refresh
      // We refresh transactions
      Object.values(getState().transactions).forEach(transaction =>
        web3Service.getTransaction(transaction)
      )
      // We refresh keys
      Object.values(getState().keys).forEach(key => web3Service.getKey(key))
      // We refresh locks
      Object.values(getState().locks).forEach(lock => web3Service.getLock(lock))

      // and refresh or load the account
      return web3Service.refreshOrGetAccount(getState().account)
    }
  })

  return function(next) {
    return function(action) {
      // As long as middleware is not ready
      if (!web3Service.ready) {
        actions.push(action)
        // We return to make sure other middleware actions are not processed
        return web3Service.connect({ provider: getState().provider })
      }

      if (action.type === SET_PROVIDER) {
        web3Service.connect({ provider: action.provider })
      } else if (action.type === CREATE_LOCK) {
        web3Service.createLock(action.lock, getState().account)
      } else if (action.type === PURCHASE_KEY) {
        const account = getState().account
        const lock = Object.values(getState().locks).find(
          lock => lock.address === action.key.lockAddress
        )
        web3Service.purchaseKey(action.key, account, lock)
      } else if (action.type === WITHDRAW_FROM_LOCK) {
        const account = getState().account
        web3Service.withdrawFromLock(action.lock, account)
      }

      next(action)

      if (action.type === LOCATION_CHANGE) {
        // Location was changed, get the matching lock
        const match = action.payload.pathname.match(
          /\/lock\/(0x[a-fA-F0-9]{40})$/
        )
        if (match) {
          web3Service.getLock({ address: match[1] })
        }
      } else if (action.type === SET_ACCOUNT) {
        const lock = getState().network.lock
        if (lock && lock.address) {
          // TODO(julien): isn't lock always set anyway?
          web3Service.getKey({
            lockAddress: lock.address,
            owner: action.account,
          })
        }
      } else if (action.type === SET_LOCK) {
        // Lock was changed, get the matching key
        web3Service.getKey({
          lockAddress: action.lock.address,
          owner: getState().account,
        })
      }
    }
  }
}
