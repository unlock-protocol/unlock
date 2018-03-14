import React from 'react'

import LockMaker from './creator/LockMaker'
import { LoadingContainer } from 'drizzle-react-components'

class Unlock extends React.Component {
  render () {
    return (<LoadingContainer>
      <LockMaker />
    </LoadingContainer>)
  }
}

export default Unlock
