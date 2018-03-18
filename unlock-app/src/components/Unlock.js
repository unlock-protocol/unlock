import React from 'react'
import { Container} from 'reactstrap'

import LockMaker from './creator/LockMaker'

class Unlock extends React.Component {
  render () {
    return (
      <Container>
        <LockMaker />
      </Container>
    )
  }
}

export default Unlock
