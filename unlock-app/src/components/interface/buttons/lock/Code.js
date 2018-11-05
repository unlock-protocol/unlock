import React from 'react'
import Svg from '../../svg'
import { LockButton } from '../Button'

const Code = props => (
  <LockButton {...props}>
    <Svg.Code />
  </LockButton>
)

export default Code
