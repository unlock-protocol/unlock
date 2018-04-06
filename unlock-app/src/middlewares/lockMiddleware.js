import { LOCATION_CHANGE } from 'react-router-redux'

import LockContract from '../artifacts/contracts/Lock.json'

export default function lockMiddleware ({ getState, dispatch }) {
  let drizzle
  return function (next) {
    return function (action) {
      // First, keep track of drizzle
      if (action.type === 'DRIZZLE_INITIALIZED') {
        drizzle = action.drizzle
      }

      if (drizzle) {
        // TODO: check if EVENT_FIRED is the right event to use?
        // Maybe we actually need to use TX_SUCCESSFUL?
        if (action.type === 'EVENT_FIRED' && action.event.event === 'NewLock') {
          const NewLock = Object.assign({}, LockContract, {})
          drizzle.addContract(NewLock, action.event.returnValues.newLockAddress, [])
        }

        if (action.type === LOCATION_CHANGE) {
          const match = action.payload.pathname.match(/\/lock\/(0x[a-fA-F0-9]{40})$/)
          if (match) {
            const NewLock = Object.assign({}, LockContract, {})
            drizzle.addContract(NewLock, match[1], [])
          }
        }
      }
      let returnValue = next(action)
      return returnValue
    }
  }
}
