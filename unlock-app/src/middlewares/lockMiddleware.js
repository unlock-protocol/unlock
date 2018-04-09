import { LOCATION_CHANGE } from 'react-router-redux'
import { CREATE_LOCK, NEW_LOCK, PURCHASE_KEY, SET_LOCK} from '../actions/lock'
import { SET_ACCOUNT } from '../actions/accounts'

import { createLock, getLock, purchaseKey, getCurrentKey } from '../services/web3Service'

// this middleware listen to redux events and invokes the web3 service APIs.
// TODO: remove reliance on getState by making each action "pure"

export default function lockMiddleware ({ getState }) {
  return function (next) {
    return function (action) {
      if (action.type === CREATE_LOCK) {
        // Create a lock
        createLock(action.lock, getState().currentAccount)
      } else if (action.type === NEW_LOCK) {
        // When a lock has been created, let's retrieve it
        getLock(action.lockAddress)
      } else if (action.type === PURCHASE_KEY) {
        // when a key has been purchased
        purchaseKey(action.lock.address, action.account, action.lock.keyPrice(), '') // TODO change data from ''
      } else if (action.type === LOCATION_CHANGE) {
        // When the location was changed, get the matching lock
        const match = action.payload.pathname.match(/\/lock\/(0x[a-fA-F0-9]{40})$/)
        if (match) {
          getLock(match[1])
        }
      } else if (action.type === SET_ACCOUNT) {
        // When the account was changed, get the matching key
        const currentLock = getState().currentLock
        if (currentLock) {
          getCurrentKey(currentLock.address, action.account)
        }
      } else if (action.type === SET_LOCK) {
        // When the lock was changed, get the matching key
        const currentAccount = getState().currentAccount
        if (currentAccount) {
          getCurrentKey(action.lock.address, currentAccount)
        }
      }

      let returnValue = next(action)
      return returnValue
    }
  }
}
