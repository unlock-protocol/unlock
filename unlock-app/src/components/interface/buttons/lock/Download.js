import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Download = (props) => (
  <Button label="Download" {...props}>
    <Svg.Download name="Download" />
  </Button>
)

export default Download
