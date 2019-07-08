import { createStore, applyMiddleware, combineReducers, compose } from 'redux'

import {
  routerReducer,
  createRouterMiddleware,
  initialRouterState,
} from 'connected-next-router'

import configure from './config'

// Reducers
import keysReducer, {
  initialState as defaultKeys,
} from './reducers/keysReducer'
import keysPagesReducer, {
  initialState as defaultKeysPages,
} from './reducers/keysPagesReducer'
import loadingReducer, {
  initialState as defaultLoading,
} from './reducers/loadingReducer'
import locksReducer, {
  initialState as defaultLocks,
} from './reducers/locksReducer'
import networkReducer, {
  initialState as defaultNetwork,
} from './reducers/networkReducer'
import providerReducer, {
  initialState as defaultProvider,
} from './reducers/providerReducer'
import transactionsReducer, {
  initialState as defaultTransactions,
} from './reducers/transactionsReducer'
import currencyReducer, {
  initialState as defaultCurrency,
} from './reducers/currencyReducer'
import errorsReducer, {
  initialState as defaultError,
} from './reducers/errorsReducer'
import accountReducer, {
  initialState as defaultAccount,
} from './reducers/accountReducer'
import lockFormVisibilityReducer, {
  initialState as defaultLockFormVisibility,
} from './reducers/lockFormVisibilityReducer'
import fullScreenModalsReducer, {
  initialState as defaultFullScreenModalsStatus,
} from './reducers/fullScreenModalsReducer'
import privateKeyReducer, {
  initialState as defaultPrivateKeyState,
} from './reducers/privateKeyReducer'
import cartReducer, {
  initialState as defaultCartState,
} from './reducers/cartReducer'

const config = configure()

export const createUnlockStore = (
  defaultState = {},
  middlewares = [],
  path
) => {
  const reducers = {
    router: routerReducer,
    account: accountReducer,
    keys: keysReducer,
    keysForLockByPage: keysPagesReducer,
    loading: loadingReducer,
    locks: locksReducer,
    network: networkReducer,
    provider: providerReducer,
    transactions: transactionsReducer,
    currency: currencyReducer,
    errors: errorsReducer,
    lockFormStatus: lockFormVisibilityReducer,
    fullScreenModalStatus: fullScreenModalsReducer,
    userDetails: privateKeyReducer,
    cart: cartReducer,
  }

  // Cleanup the defaultState to remove all null values so that we do not overwrite existing
  // values with null
  Object.keys(defaultState).forEach(
    k => defaultState[k] == null && delete defaultState[k]
  )

  // We build the initial state by taking first each reducer's default values
  // Then some overides and finally whatever state we have stored locally.
  const initialState = Object.assign(
    {
      router: initialRouterState(path),
      account: defaultAccount,
      keys: defaultKeys,
      keysForLockByPage: defaultKeysPages,
      loading: defaultLoading,
      locks: defaultLocks,
      network: defaultNetwork,
      provider: defaultProvider,
      transactions: defaultTransactions,
      currency: defaultCurrency,
      errors: defaultError,
      lockFormStatus: defaultLockFormVisibility,
      fullScreenModalStatus: defaultFullScreenModalsStatus,
      userDetails: defaultPrivateKeyState,
      cart: defaultCartState,
    },
    {
      provider: Object.keys(config.providers)[0],
    },
    defaultState
  )

  middlewares.push(createRouterMiddleware())

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
