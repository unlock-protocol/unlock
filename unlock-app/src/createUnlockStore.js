import { loadState } from './services/localStorageService'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import { routerReducer, routerMiddleware } from 'react-router-redux'

// Reducers
import networkReducer from './reducers/networkReducer'
import accountReducer from './reducers/accountReducer'
import providerReducer from './reducers/providerReducer'
import transactionReducer  from './reducers/transactionReducer'
import locksReducer  from './reducers/locksReducer'

// Middlewares
import lockMiddleware from './middlewares/lockMiddleware'

export default function createUnlockStore(config, browserHistory) {

  const reducers = {
    router: routerReducer,
    provider: providerReducer,
    network: networkReducer,
    account: accountReducer,
    transactions: transactionReducer,
    locks: locksReducer,
  }

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const initialState = Object.assign({
    network: {
      name: 0,
    },
    account: null,
    transactions: {
      latest: null,
      all: {},
      lastUpdated: 0,
    },
    locks: [],
  }, loadState())

  const middlewares = [
    routerMiddleware(browserHistory),
    lockMiddleware,
  ]

  return createStore(
    combineReducers(reducers),
    initialState,
    composeEnhancers(applyMiddleware(...middlewares)),
  )
}
