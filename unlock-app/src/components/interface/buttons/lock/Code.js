import Svg from '../../svg'
import React from 'react'
import { LockButton } from '../Button'

const Code = (props) => (
  <LockButton {...props}>
    <Svg.Code />
  </LockButton>
)

export default Code
