import { createStore, applyMiddleware, combineReducers, compose } from 'redux'

import configure from './config'

// Reducers
import keysReducer, {
  initialState as defaultKeys,
} from './reducers/keysReducer'
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
import walletStatusReducer, {
  initialState as defaultWalletStatus,
} from './reducers/walletStatusReducer'

const config = configure()

export const createUnlockStore = (defaultState = {}, middlewares = []) => {
  const reducers = {
    account: accountReducer,
    keys: keysReducer,
    locks: locksReducer,
    network: networkReducer,
    provider: providerReducer,
    transactions: transactionsReducer,
    currency: currencyReducer,
    errors: errorsReducer,
    walletStatus: walletStatusReducer,
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
      account: defaultAccount,
      keys: defaultKeys,
      locks: defaultLocks,
      network: defaultNetwork,
      provider: defaultProvider,
      transactions: defaultTransactions,
      currency: defaultCurrency,
      errors: defaultError,
      walletStatus: defaultWalletStatus,
    },
    {
      provider: Object.keys(config.providers)[0],
    },
    defaultState
  )

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
