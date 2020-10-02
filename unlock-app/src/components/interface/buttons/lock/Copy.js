import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Copy = (props) => (
  <Button label="Copy" {...props}>
    <Svg.Copy name="Copy" />
  </Button>
)

export default Copy
