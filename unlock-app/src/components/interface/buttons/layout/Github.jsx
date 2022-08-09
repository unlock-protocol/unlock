import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

const Github = (props) => (
  <LayoutButton
    href="https://github.com/unlock-protocol/unlock"
    label="Source Code"
    {...props}
  >
    <Svg.Github name="Github" />
  </LayoutButton>
)

export default Github
