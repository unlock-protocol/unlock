import { loadState } from './services/localStorageService'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

// Reducers
import networkReducer from './reducers/networkReducer'
import providerReducer from './reducers/providerReducer'
import transactionReducer  from './reducers/transactionReducer'
import locksReducer  from './reducers/locksReducer'
import keysReducer  from './reducers/keysReducer'

// Middlewares
import lockMiddleware from './middlewares/lockMiddleware'

export default function createUnlockStore(config, browserHistory) {
  const reducers = {
    provider: providerReducer,
    network: networkReducer,
    transactions: transactionReducer,
    locks: locksReducer,
    keys: keysReducer,
  }

  // TODO: DRY this because each reducer has its own initial state.
  const initialState = Object.assign({
    network: {
      name: 0,
    },
    transactions: {
      latest: null,
      all: {},
      lastUpdated: 0,
    },
    locks: {},
    keys: {},
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
