import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const ExportLock = props => (
  <Button {...props}>
    <Svg.Export name="Export" />
  </Button>
)

export default ExportLock
