// Modules
import createHistory from 'history/createBrowserHistory'
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'

// Services
import { saveState } from './services/localStorageService'

// Components
import Unlock from './components/Unlock'

// Styles
import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

// Store
import createUnlockStore from './createUnlockStore'

class App extends Component {
  constructor (props, context) {
    super(props)

    this.browserHistory = createHistory()

    this.store = createUnlockStore(this.browserHistory)

    this.store.subscribe(() => {
      saveState(this.store.getState())
    })

  }

  render () {
    return (
      <Provider store={this.store}>
        <ConnectedRouter history={this.browserHistory}>
          <div className="container">
            <Unlock />
          </div>
        </ConnectedRouter>
      </Provider>
    )
  }
}

export default App
