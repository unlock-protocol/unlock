import React from 'react'
import Svg from '../../svg'
import { LockButton } from '../Button'

const Download = props => (
  <LockButton {...props}>
    <Svg.Download />
  </LockButton>
)

export default Download
