import { createStore, applyMiddleware, combineReducers, compose } from 'redux'

import configure from './config'

// Reducers
import locksReducer, {
  initialState as defaultLocks,
} from './reducers/locksReducer'
import loadingReducer, {
  initialState as defaultLoading,
} from './reducers/loadingReducer'
import networkReducer, {
  initialState as defaultNetwork,
} from './reducers/networkReducer'
import providerReducer, {
  initialState as defaultProvider,
} from './reducers/providerReducer'
import errorsReducer, {
  initialState as defaultError,
} from './reducers/errorsReducer'
import accountReducer, {
  initialState as defaultAccount,
} from './reducers/accountReducer'
import walletStatusReducer, {
  initialState as defaultWalletStatus,
} from './reducers/walletStatusReducer'
import eventReducer, {
  initialState as defaultEvent,
} from './reducers/eventReducer'

const config = configure()

export const createUnlockStore = (defaultState = {}, middlewares = []) => {
  const reducers = {
    account: accountReducer,
    locks: locksReducer,
    loading: loadingReducer,
    network: networkReducer,
    provider: providerReducer,
    errors: errorsReducer,
    walletStatus: walletStatusReducer,
    event: eventReducer,
  }

  // Cleanup the defaultState to remove all null values so that we do not overwrite existing
  // values with null
  Object.keys(defaultState).forEach(
    k => defaultState[k] == null && delete defaultState[k]
  )

  // We build the initial state by taking first each reducer's default values
  // Then some overides and finally whatever state we have stored locally.
  const initialState = {
    account: defaultAccount,
    locks: defaultLocks,
    loading: defaultLoading,
    network: defaultNetwork,
    provider: defaultProvider,
    errors: defaultError,
    walletStatus: defaultWalletStatus,
    event: defaultEvent,
    provider: Object.keys(config.providers)[0],
    ...defaultState,
  }

  const composeEnhancers =
    (global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        trace: true,
        traceLimit: 25,
      })) ||
    compose

  return createStore(
    combineReducers(reducers),
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  )
}

export default createUnlockStore
