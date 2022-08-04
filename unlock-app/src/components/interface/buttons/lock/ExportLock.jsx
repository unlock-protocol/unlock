import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const ExportLock = (props) => (
  <Button label="Export" {...props}>
    <Svg.Export name="Export" />
  </Button>
)

export default ExportLock
