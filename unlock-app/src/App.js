// Modules
import React, { Component } from 'react'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import { Provider } from 'react-redux'
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'
import Web3 from 'web3'

// Services
import { initWeb3Service } from './services/web3Service'

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

// Middlewares
import lockMiddleware from './middlewares/lockMiddleware'

class App extends Component {
  constructor (props, context) {
    super(props)

    const reducers = {
      router: routerReducer,
      accounts: accountsReducer,
      account: accountReducer,
      locks: locksReducer,
      lock: lockReducer,
      key: keyReducer,
    }

    const initialState = {
      accounts: [],
      account: null,
      locks: [],
      lock: null,
      key: {
        expiration: 0,
        data: '',
      }, // no key set
    }

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
      composeEnhancers(applyMiddleware(...middlewares))
    )

    // connects to the web3 endpoint
    initWeb3Service(new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545'), this.store.dispatch)
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
