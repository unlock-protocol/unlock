import { LOCATION_CHANGE } from 'react-router-redux'
import { CREATE_LOCK, SET_LOCK } from '../actions/lock'
import { PURCHASE_KEY, SET_KEY } from '../actions/key'
import { SET_ACCOUNT } from '../actions/accounts'
import { SET_NETWORK } from '../actions/network'

import { initWeb3Service, createLock, getLock, purchaseKey, getKey } from '../services/web3Service'
import { sendMessage } from '../services/iframeService'

// This middleware listen to redux events and invokes the services APIs.
export default function lockMiddleware ({ getState, dispatch }) {
  return function (next) {
    return function (action) {
      if (action.type === SET_NETWORK) {
        initWeb3Service(getState().networks[action.network], dispatch)
        // We should probably reset eveything?
      } else if (action.type === CREATE_LOCK) {
        // Create a lock
        createLock(action.lock, getState().account)
      } else if (action.type === PURCHASE_KEY) {
        // A key has been purchased
        purchaseKey(action.lock.address, action.account, action.lock.keyPrice(), '') // TODO change data from ''
      } else if (action.type === LOCATION_CHANGE) {
        // Location was changed, get the matching lock
        const match = action.payload.pathname.match(/\/lock\/(0x[a-fA-F0-9]{40})$/)
        if (match) {
          getLock(match[1])
        }
      } else if (action.type === SET_ACCOUNT) {
        // Account was changed, get the matching key
        const lock = getState().lock
        if (lock) {
          // TODO(julien): isn't lock always set anyway?
          getKey(lock.address, action.account)
        }
      } else if (action.type === SET_LOCK) {
        // Lock was changed, get the matching key
        const account = getState().account
        if (account) {
          // TODO(julien): isn't account always set anyway?
          getKey(action.lock.address, account)
        }
      } else if (action.type === SET_KEY) {
        // Key was set, ensure that we communicate this to other frames
        sendMessage({key: action.key})
      }

      let returnValue = next(action)
      return returnValue
    }
  }
}
