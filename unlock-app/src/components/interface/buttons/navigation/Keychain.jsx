import React from 'react'
import Svg from '../../svg'
import PageNavButton from '../PageNavButton'

const Keychain = (props) => (
  <PageNavButton href="/keychain" label="Keychain" {...props}>
    <Svg.Key title="Keychain" />
  </PageNavButton>
)

export default Keychain
