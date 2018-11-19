import React from 'react'
import Svg from '../../svg'
import { LockButton } from '../Button'

const Code = props => (
  <LockButton title="Show embed code" {...props}>
    <Svg.Code name="Code" />
  </LockButton>
)

export default Code
