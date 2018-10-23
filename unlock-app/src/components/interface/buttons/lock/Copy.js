import Svg from '../../svg'
import React from 'react'
import { LockButton } from '../Button'

const Copy = (props) => (
  <LockButton {...props}>
    <Svg.Copy />
  </LockButton>
)

export default Copy
