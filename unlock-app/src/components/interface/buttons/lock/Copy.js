import React from 'react'
import Svg from '../../svg'
import { LockButton } from '../Button'

const Copy = (props) => (
  <LockButton {...props}>
    <Svg.Copy name="Copy" />
  </LockButton>
)

export default Copy
