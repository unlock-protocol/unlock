import {
  CREATE_LOCK,
  WITHDRAW_FROM_LOCK,
  deleteLock,
  UPDATE_LOCK_KEY_PRICE,
  LOCK_DEPLOYED,
} from '../actions/lock'
import { PURCHASE_KEY } from '../actions/key'
import { setAccount, SET_ACCOUNT } from '../actions/accounts'
import { setNetwork, SET_NETWORK } from '../actions/network'
import { setError } from '../actions/error'
import { SET_PROVIDER } from '../actions/provider'
import { addTransaction } from '../actions/transaction'
import { TRANSACTION_TYPES } from '../constants'

import generateJWTToken from '../utils/signature'
import WalletService from '../services/walletService'
import { signatureError } from '../actions/signature'
import { storeLockCreation, storeLockUpdate } from '../actions/storage'
import configure from '../config'

const config = configure()

// This middleware listen to redux events and invokes the walletService API.
// It also listen to events from walletService and dispatches corresponding actions
export default function walletMiddleware({ getState, dispatch }) {
  // Buffer of actions waiting for connection
  const actions = []

  const walletService = new WalletService()

  /**
   * When an account was changed, we dispatch the corresponding action
   * The setAccount action will reset other relevant redux state
   */
  walletService.on('account.changed', account => {
    dispatch(setAccount(account))
  })

  walletService.on('transaction.new', transaction => {
    dispatch(addTransaction(transaction))
  })

  walletService.on('error', (error, transactionHash) => {
    const transaction = getState().transactions[transactionHash]
    if (transaction && transaction.type === TRANSACTION_TYPES.LOCK_CREATION) {
      // delete the lock
      dispatch(deleteLock(transaction.lock))
      return dispatch(
        setError('Failed to create lock. Did you decline the transaction?')
      )
    }
    dispatch(setError(error.message))
  })

  /**
   * When the network has changed, we need to get a new account
   * as well as reset all the reducers
   */
  walletService.on('network.changed', networkId => {
    // Set the new network, which should also clean up all reducers
    // And we need a new account!
    dispatch(setNetwork(networkId))
    return walletService.getAccount()
  })

  /**
   * This is invoked when the walletService is ready. We can then (re)trigger all past actions.
   */
  walletService.on('ready', () => {
    while (actions.length > 0) {
      let action = actions.shift()
      dispatch(action)
    }
  })

  return function(next) {
    return function(action) {
      if (
        !walletService.ready &&
        [SET_NETWORK, SET_ACCOUNT, SET_PROVIDER].indexOf(action.type) == -1
      ) {
        // As long as middleware is not ready
        // we store the action
        actions.push(action)
        return walletService.connect(getState().provider)
      } else if (action.type === SET_PROVIDER) {
        walletService.connect(action.provider)
      } else if (action.type === CREATE_LOCK) {
        // Create the lock
        walletService.createLock(action.lock, getState().account)

        // And sign its name
        if (config.services.storage) {
          generateJWTToken(walletService, getState().account.address, {
            lock: action.lock,
          })
            .then(token => {
              dispatch(
                storeLockCreation(
                  getState().account.address,
                  action.lock,
                  token
                )
              )
            })
            .catch(error => {
              dispatch(signatureError(error))
            })
        }
      } else if (action.type === PURCHASE_KEY) {
        const account = getState().account
        // find the lock to get its keyPrice
        const lock = Object.values(getState().locks).find(
          lock => lock.address === action.key.lock
        )
        walletService.purchaseKey(
          action.key.lock,
          action.key.owner,
          lock.keyPrice,
          account,
          action.key.data
        )
      } else if (action.type === WITHDRAW_FROM_LOCK) {
        const account = getState().account
        walletService.withdrawFromLock(action.lock, account)
      } else if (action.type === UPDATE_LOCK_KEY_PRICE) {
        const account = getState().account
        walletService.updateKeyPrice(action.address, account, action.price)
      } else if (action.type === LOCK_DEPLOYED) {
        // When a lock has been deployed, we need to sign its name again
        if (config.services.storage) {
          if (action.lock && action.lock.address && action.address) {
            generateJWTToken(walletService, getState().account.address, {
              currentAddress: action.lock.address,
              address: action.address,
              owner: getState().account.address,
            }).then(token => {
              dispatch(
                storeLockUpdate(
                  getState().account.address,
                  action.lock.address,
                  token,
                  action.address
                )
              )
            })
          }
        }
      }

      next(action)
    }
  }
}
