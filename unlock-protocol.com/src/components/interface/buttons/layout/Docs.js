import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

const Docs = (props) => (
  <LayoutButton href="https://docs.unlock-protocol.com" label="Docs" {...props}>
    <Svg.Docs name="Docs" />
  </LayoutButton>
)

export default Docs
