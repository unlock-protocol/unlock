// Modules
import React, { Component } from 'react'
import { generateStore } from 'drizzle'
import { Provider } from 'react-redux'
import { ConnectedRouter, routerReducer, routerMiddleware} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

// Components
import UnlockComponent from './components/Unlock'

// Styles
import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

// Import Unlock contract
import Unlock from './artifacts/contracts/Unlock.json'

// Reducers
import accountReducer from './reducers/accountReducer'
import lockReducer from './reducers/lockReducer'

// Middlewares
import lockMiddleware from './middlewares/lockMiddleware'

class App extends Component {
  constructor (props, context) {
    super(props)
    this.drizzleOptions = {
      contracts: [Unlock],
      events: {
        Unlock: [
          'NewLock'
        ]
      },
      web3: {
        block: false,
        fallback: {
          type: 'ws',
          url: 'ws://127.0.0.1:8545'
        }
      }
    }

    const reducers = {
      route: routerReducer,
      currentAccount: accountReducer,
      currentLockAddress: lockReducer
    }

    const initialState = {
      currentAccount: null,
      currentLockAddress: null
    }

    // Create a history of your choosing (we're using a browser history in this case)
    this.browserHistory = createHistory()
    const routeMiddleware = routerMiddleware(this.browserHistory)

    const middlewares = [
      routeMiddleware,
      lockMiddleware
    ]

    // create our own store!
    // We cannot use the default one built by the provider because we want to add our own state!
    this.store = generateStore(this.drizzleOptions, reducers, initialState, middlewares)
  }

  render () {
    return (
      <Provider options={this.drizzleOptions} store={this.store}>
        <ConnectedRouter history={this.browserHistory} store={this.store}>
          <UnlockComponent store={this.store} />
        </ConnectedRouter>
      </Provider>
    )
  }
}

export default App
