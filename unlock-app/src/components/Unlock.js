import React from 'react'
import { Container, Navbar, Nav} from 'reactstrap'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Account from './Account'
import LockMaker from './creator/LockMaker'

class Unlock extends React.Component {
  render () {
    return (
      <Container>
        <Navbar>
          <Nav>
            <Account />
          </Nav>
        </Navbar>
        <Router>
          <Route path="/creator" component={LockMaker} />
        </Router>
      </Container>
    )
  }
}

export default Unlock
