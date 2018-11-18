import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
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
import transactionReducer, {
  initialState as defaultTransactions,
} from './reducers/transactionReducer'
import currencyReducer, {
  initialState as defaultCurrency,
} from './reducers/currencyReducer'
import errorReducer, {
  initialState as defaultError,
} from './reducers/errorReducer'
import accountReducer, {
  initialState as defaultAccount,
} from './reducers/accountReducer'

// Middlewares
import lockMiddleware from './middlewares/lockMiddleware'
import currencyConversionMiddleware from './middlewares/currencyConversionMiddleware'

const config = configure(global)

export default function createUnlockStore(defaultState = {}) {
  const reducers = {
    account: accountReducer,
    keys: keysReducer,
    locks: locksReducer,
    network: networkReducer,
    provider: providerReducer,
    transactions: transactionReducer,
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

  const middlewares = [lockMiddleware, currencyConversionMiddleware]

  return createStore(
    combineReducers(reducers),
    initialState,
    composeWithDevTools(applyMiddleware(...middlewares))
  )
}
