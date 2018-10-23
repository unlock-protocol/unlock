import Svg from '../../svg'
import React from 'react'
import { LockButton } from '../Button'

const ExportLock = (props) => (
  <LockButton {...props}>
    <Svg.Export />
  </LockButton>
)

export default ExportLock
