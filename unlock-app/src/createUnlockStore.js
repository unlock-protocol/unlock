import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createMemoryHistory } from 'history'

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
import errorReducer, {
  initialState as defaultError,
} from './reducers/errorReducer'
import accountReducer, {
  initialState as defaultAccount,
} from './reducers/accountReducer'
import modalReducer, {
  initialState as defaultModals,
} from './reducers/modalsReducer'

// Middlewares
import lockMiddleware from './middlewares/lockMiddleware'
import currencyConversionMiddleware from './middlewares/currencyConversionMiddleware'
import storageMiddleware from './middlewares/storageMiddleware'

const config = configure(global)

export const createUnlockStore = (
  defaultState = {},
  history = createMemoryHistory()
) => {
  const reducers = {
    router: connectRouter(history),
    account: accountReducer,
    keys: keysReducer,
    locks: locksReducer,
    modals: modalReducer,
    network: networkReducer,
    provider: providerReducer,
    transactions: transactionsReducer,
    currency: currencyReducer,
    error: errorReducer,
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
      modals: defaultModals,
      network: defaultNetwork,
      provider: defaultProvider,
      transactions: defaultTransactions,
      currency: defaultCurrency,
      error: defaultError,
    },
    {
      provider: Object.keys(config.providers)[0],
    },
    defaultState
  )

  const middlewares = [
    lockMiddleware,
    currencyConversionMiddleware,
    storageMiddleware,
    routerMiddleware(history),
  ]

  return createStore(
    combineReducers(reducers),
    initialState,
    composeWithDevTools(applyMiddleware(...middlewares))
  )
}

export default createUnlockStore
