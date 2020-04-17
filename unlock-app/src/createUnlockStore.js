import { createStore, applyMiddleware, combineReducers, compose } from 'redux'

import {
  routerReducer,
  createRouterMiddleware,
  initialRouterState,
} from 'connected-next-router'

// Reducers

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
import userDetailsReducer, {
  initialState as defaultUserDetails,
} from './reducers/userDetails'
import cartReducer, {
  initialState as defaultCartState,
} from './reducers/cartReducer'
import recoveryReducer, {
  initialState as defaultRecoveryPhrase,
} from './reducers/recoveryReducer'
import pageStatusReducer, {
  initialState as defaultPageStatus,
} from './reducers/pageStatusReducer'
import signatureReducer, {
  initialState as defaultSignatureState,
} from './reducers/signatureReducer'

export const createUnlockStore = (
  defaultState = {},
  middlewares = [],
  path
) => {
  const reducers = {
    router: routerReducer,
    account: accountReducer,
    loading: loadingReducer,
    locks: locksReducer,
    network: networkReducer,
    provider: providerReducer,
    transactions: transactionsReducer,
    errors: errorsReducer,
    lockFormStatus: lockFormVisibilityReducer,
    fullScreenModalStatus: fullScreenModalsReducer,
    userDetails: userDetailsReducer,
    cart: cartReducer,
    recoveryPhrase: recoveryReducer,
    pageIsLocked: pageStatusReducer,
    signature: signatureReducer,
  }

  // Cleanup the defaultState to remove all null values so that we do not overwrite existing
  // values with null
  Object.keys(defaultState).forEach(
    k => defaultState[k] == null && delete defaultState[k]
  )

  // We build the initial state by taking first each reducer's default values
  // Then some overides and finally whatever state we have stored locally.
  const initialState = {
    router: initialRouterState(path),
    account: defaultAccount,
    loading: defaultLoading,
    locks: defaultLocks,
    network: defaultNetwork,
    provider: defaultProvider,
    transactions: defaultTransactions,
    errors: defaultError,
    lockFormStatus: defaultLockFormVisibility,
    fullScreenModalStatus: defaultFullScreenModalsStatus,
    userDetails: defaultUserDetails,
    recoveryPhrase: defaultRecoveryPhrase,
    cart: defaultCartState,
    pageIsLocked: defaultPageStatus,
    signature: defaultSignatureState,
    provider: null, // This will be set in the UI!
    ...defaultState,
  }

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
