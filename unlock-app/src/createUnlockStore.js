import { loadState } from './services/localStorageService'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

// Reducers
import networkReducer, { initialState as defaultNetwork } from './reducers/networkReducer'
import providerReducer, { initialState as defaultProvider } from './reducers/providerReducer'
import transactionReducer, { initialState as defaultTransactions } from './reducers/transactionReducer'
import locksReducer, { initialState as defaultLocks } from './reducers/locksReducer'
import keysReducer, { initialState as defaultKeys } from './reducers/keysReducer'

// Middlewares
import lockMiddleware from './middlewares/lockMiddleware'

export default function createUnlockStore(config, browserHistory) {
  const reducers = {
    keys: keysReducer,
    locks: locksReducer,
    network: networkReducer,
    provider: providerReducer,
    transactions: transactionReducer,
  }

  const initialState = Object.assign({
    keys: defaultKeys,
    locks: defaultLocks,
    network: defaultNetwork,
    provider: defaultProvider,
    transactions: defaultTransactions,
  }, loadState())

  const middlewares = [
    lockMiddleware,
  ]

  return createStore(
    combineReducers(reducers),
    initialState,
    composeWithDevTools(applyMiddleware(...middlewares))
  )
}
