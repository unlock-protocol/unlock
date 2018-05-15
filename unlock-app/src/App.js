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
import networkReducer from './reducers/networkReducer'

// Middlewares
import lockMiddleware from './middlewares/lockMiddleware'

class App extends Component {
  constructor (props, context) {
    super(props)

    const reducers = {
      router: routerReducer,
      network: networkReducer,
    }

    const initialState = Object.assign({
      network: {
        name: 'dev', // default?
      },
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
    initWeb3Service({
      network: this.store.getState().network,
    }, this.store.dispatch)
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
