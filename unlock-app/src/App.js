// Modules
import React, { Component } from 'react'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import { Provider } from 'react-redux'
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

// Services
import { initWeb3Service } from './services/web3Service'
import { saveState, loadState } from './services/localStorageService'

// Components
import Unlock from './components/Unlock'

// Styles
import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

// Reducers
import accountReducer from './reducers/accountReducer'
import lockReducer from './reducers/lockReducer'
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
      account: accountReducer,
      lock: lockReducer,
      key: keyReducer,
      network: networkReducer,
    }

    const initialState = Object.assign({
      account: {},
      lock: null,
      network: null, // default?
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
    initWeb3Service({ network: networks.dev }, this.store.dispatch)
  }

  render () {
    if (!this.store.getState().account) {
      return(<span>Loading</span>)
    }
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
