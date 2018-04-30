import React from 'react'
import { Container, Navbar, Nav } from 'reactstrap'
import { Route, Switch } from 'react-router'

import Account from './Account'
import Network from './Network'
import LockMaker from './creator/LockMaker'
import Lock from './consumer/Lock'
import Home from './Home'

export const Unlock = () => {
  return (
    <Container>
      <Navbar>
        <Nav>
          <Network />
          <Account />
        </Nav>
      </Navbar>
      <Switch>
        <Route path="/creator" component={LockMaker} />
        <Route path="/lock/:lockAddress" component={Lock} />
        <Route path="*" component={Home} />
      </Switch>
    </Container>
  )
}

export default Unlock
