import Svg from '../../svg'
import React from 'react'
import { LockButton } from '../Button'

const Download = (props) => (
  <LockButton {...props}>
    <Svg.Download />
  </LockButton>
)

export default Download
