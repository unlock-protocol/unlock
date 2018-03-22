// Modules
import React, { Component } from 'react'
import { DrizzleProvider } from 'drizzle-react'
import { Container } from 'reactstrap'
import { LoadingContainer } from 'drizzle-react-components'

// Components
import UnlockComponent from './components/Unlock'

// Styles
import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

// Import Unlock contract
import Unlock from './artifacts/contracts/Unlock.json'

// Drizzle options
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
        <Container>
          <LoadingContainer>
            <UnlockComponent />
          </LoadingContainer>
        </Container>
      </DrizzleProvider>
    )
  }
}

export default App
