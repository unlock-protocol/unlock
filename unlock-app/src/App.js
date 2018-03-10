import React, { Component } from 'react'
import { DrizzleProvider } from 'drizzle-react'
import logo from './logo.svg'
import './App.css'

// Import Unlock contract
import Unlock from './artifacts/contracts/Unlock.json'

const options = {
  contracts: [Unlock],
  events: [],
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  }
}
class App extends Component {
  render () {
    return (
      <DrizzleProvider options={options}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
        </div>
      </DrizzleProvider>
    )
  }
}

export default App
