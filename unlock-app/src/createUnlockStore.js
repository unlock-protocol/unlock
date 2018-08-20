import { loadState } from './services/localStorageService'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import { routerReducer, routerMiddleware } from 'react-router-redux'

// Reducers
import networkReducer from './reducers/networkReducer'

// Middlewares
import lockMiddleware from './middlewares/lockMiddleware'

export default function createUnlockStore(config, browserHistory) {

  const reducers = {
    router: routerReducer,
    network: networkReducer,
  }

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const initialState = Object.assign({
    network: {
      name: config.requiredNetwork || config.defaultNetwork,
    },
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