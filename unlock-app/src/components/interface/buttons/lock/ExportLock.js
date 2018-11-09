import React from 'react'
import Svg from '../../svg'
import { LockButton } from '../Button'

const ExportLock = (props) => (
  <LockButton {...props}>
    <Svg.Export name="Export" />
  </LockButton>
)

export default ExportLock
