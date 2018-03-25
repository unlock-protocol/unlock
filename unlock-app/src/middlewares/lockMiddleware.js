
import LockContract from '../artifacts/contracts/Lock.json'

export default function lockMiddleware ({ getState, dispatch }) {
  let drizzle
  return function (next) {
    return function (action) {
      // First, keep track of drizzle
      if (action.type === 'DRIZZLE_INITIALIZED') {
        drizzle = action.drizzle
      }

      // TODO: check if EVENT_FIRED is the right event to use?
      // Maybe we actually need to use TX_SUCCESSFUL?
      if (drizzle && action.type === 'EVENT_FIRED' && action.event.event === 'NewLock') {
        const NewLock = Object.assign({}, LockContract, {})
        drizzle.addContract(NewLock, action.event.returnValues.newLockAddress, [])
      }

      if (drizzle && action.type === 'LOAD_LOCK') {
        const NewLock = Object.assign({}, LockContract, {})
        // Something is fishy here:
        // We get an message in the console:
        // index.js:2178 Warning: Cannot update during an existing state transition (such as within `render` or another component's constructor). Render methods should be a pure function of props and state; constructor side-effects are an anti-pattern, but can be moved to `componentWillMount`.
        drizzle.addContract(NewLock, action.lockAddress, [])
      }

      // Keep going!
      let returnValue = next(action)
      return returnValue
    }
  }
}
