// Modules
import React, { Component } from 'react'
import { generateStore } from 'drizzle'
import { DrizzleProvider } from 'drizzle-react'
import { LoadingContainer } from 'drizzle-react-components'

// Components
import UnlockComponent from './components/Unlock'

// Styles
import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

// Import Unlock contract
import Unlock from './artifacts/contracts/Unlock.json'

// Reducers
import accountReducer from './reducers/accountReducer'

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
      currentAccount: accountReducer
    }

    const initialState = {
      currentAccount: null
    }

    const middlewares = [lockMiddleware]

    // create our own store!
    // We cannot use the default one built by the provider because we want to add our own state!
    this.store = generateStore(this.drizzleOptions, reducers, initialState, middlewares)
  }

  render () {
    return (
      <DrizzleProvider options={this.drizzleOptions} store={this.store}>
        <LoadingContainer>
          <UnlockComponent />
        </LoadingContainer>
      </DrizzleProvider>
    )
  }
}

export default App
