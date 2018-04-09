import React from 'react'
import { Container, Navbar, Nav} from 'reactstrap'
import { Route } from 'react-router'

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
      <div>
        <Route path="/creator" component={LockMaker} />
        <Route path="/lock/:lockAddress" component={Lock} />
      </div>
    </Container>
  )
}

export default Unlock
