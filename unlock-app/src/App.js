// Modules
import React, { Component } from 'react'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import { Provider } from 'react-redux'
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

// Services
import { initWeb3Service, getAccounts } from './services/web3Service'
import { saveState, loadState } from './services/localStorageService'

// Components
import Unlock from './components/Unlock'

// Styles
import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

// Reducers
import accountsReducer from './reducers/accountsReducer'
import accountReducer from './reducers/accountReducer'
import lockReducer from './reducers/lockReducer'
import locksReducer from './reducers/locksReducer'
import keyReducer from './reducers/keyReducer'
import networkReducer from './reducers/networkReducer'

// Middlewares
import lockMiddleware from './middlewares/lockMiddleware'

class App extends Component {
  constructor (props, context) {
    super(props)

    const networks = {
      dev: {
        url: 'ws://127.0.0.1:8545',
        name: 'Development',
        protocol: 'ws', // couldn't we extract that from url?
      },
      rinkeby: {
        url: 'https://rinkeby.infura.io/DP8aTF8zko71UQIAe1NV ',
        name: 'Rinkeby',
        protocol: 'http', // couldn't we extract that from url?
      },
    }

    const reducers = {
      router: routerReducer,
      accounts: accountsReducer,
      account: accountReducer,
      locks: locksReducer,
      lock: lockReducer,
      key: keyReducer,
      networks: () => {
        return networks
      },
      network: networkReducer,
    }

    const initialState = Object.assign({
      accounts: [],
      account: null,
      locks: [],
      lock: null,
      network: 'dev', // default?
      networks,
      key: {
        expiration: 0,
        data: '',
      }, // no key set
    }, loadState())

    // Create a history of your choosing (we're using a browser history in this case)
    this.browserHistory = createHistory()

    const middlewares = [
      routerMiddleware(this.browserHistory),
      lockMiddleware,
    ]

    // create our own store!
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

    this.store = createStore(
      combineReducers(reducers),
      initialState,
      composeEnhancers(applyMiddleware(...middlewares)),
    )

    this.store.subscribe(() => {
      saveState(this.store.getState())
    })

    // connects to the web3 endpoint
    initWeb3Service(initialState.networks[initialState.network], this.store.dispatch)
    // get accounts... TODO: remove once accounts are not mananged on the local anymore.
    if (!this.store.getState().accounts || this.store.getState().accounts.length === 0) {
      getAccounts()
    }
  }

  render () {
    return (
      <Provider store={this.store}>
        <ConnectedRouter history={this.browserHistory}>
          <Unlock />
        </ConnectedRouter>
      </Provider>
    )
  }
}

export default App
