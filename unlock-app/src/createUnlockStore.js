import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { loadState } from './services/localStorageService'
import configure from './config'

// Reducers
import keysReducer, { initialState as defaultKeys } from './reducers/keysReducer'
import locksReducer, { initialState as defaultLocks } from './reducers/locksReducer'
import networkReducer, { initialState as defaultNetwork } from './reducers/networkReducer'
import providerReducer, { initialState as defaultProvider } from './reducers/providerReducer'
import transactionReducer, { initialState as defaultTransactions } from './reducers/transactionReducer'

// Middlewares
import lockMiddleware from './middlewares/lockMiddleware'

const config = configure(global)

export default function createUnlockStore(defaultState = loadState()) {
  const reducers = {
    keys: keysReducer,
    locks: locksReducer,
    network: networkReducer,
    provider: providerReducer,
    transactions: transactionReducer,
  }

  // We build the initial state by taking first each reducer's default values
  // Then some overides and finally whatever state we have stored locally.
  const initialState = Object.assign({
    keys: defaultKeys,
    locks: defaultLocks,
    network: defaultNetwork,
    provider: defaultProvider,
    transactions: defaultTransactions,
  }, {
    provider: Object.keys(config.providers)[0],
  }, defaultState)

  const middlewares = [
    lockMiddleware,
  ]

  return createStore(
    combineReducers(reducers),
    initialState,
    composeWithDevTools(applyMiddleware(...middlewares))
  )
}
