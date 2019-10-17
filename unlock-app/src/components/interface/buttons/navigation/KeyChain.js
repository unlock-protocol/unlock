import React from 'react'
import Svg from '../../svg'
import PageNavButton from '../PageNavButton'

const KeyChain = props => (
  <PageNavButton href="/keychain" label="Keychain" {...props}>
    <Svg.LockClosed title="Keychain" />
  </PageNavButton>
)

export default KeyChain
