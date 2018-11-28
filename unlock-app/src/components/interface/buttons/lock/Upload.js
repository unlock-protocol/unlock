import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Upload = props => (
  <Button {...props}>
    <Svg.Upload name="Upload" />
  </Button>
)

export default Upload
