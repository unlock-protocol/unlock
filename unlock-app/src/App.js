// Modules
import React, { Component } from 'react'
import { DrizzleProvider } from 'drizzle-react'

// Components
import UnlockComponent from './components/Unlock'

// Styles
import './App.css'

// Import Unlock contract
import Unlock from './artifacts/contracts/Unlock.json'

// Options
const options = {
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
class App extends Component {
  render () {
    return (
      <DrizzleProvider options={options}>
        <UnlockComponent />
      </DrizzleProvider>
    )
  }
}

export default App
