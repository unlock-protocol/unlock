import React from 'react'
import { Container, Navbar, Nav} from 'reactstrap'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Account from './Account'
import LockMaker from './creator/LockMaker'
import Lock from './consumer/Lock'

const Unlock = (props) => {
  return (
    <Container>
      <Navbar>
        <Nav>
          <Account />
        </Nav>
      </Navbar>
      <Router>
        <div>
          <Route path="/creator" component={LockMaker} />
          <Route path="/lock/:lockAddress" component={Lock} />
        </div>
      </Router>
    </Container>
  )
}

export default Unlock
