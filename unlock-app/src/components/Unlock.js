import React from 'react'
import { Container, Navbar, Nav} from 'reactstrap'

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
        <LockMaker />
      </Container>
    )
  }
}

export default Unlock
