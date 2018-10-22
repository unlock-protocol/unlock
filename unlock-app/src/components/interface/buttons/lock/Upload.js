import Svg from '../../svg'
import React from 'react'
import { LockButton } from '../Button'

const Upload = (props) => (
  <LockButton {...props}>
    <Svg.Upload />
  </LockButton>
)

export default Upload
