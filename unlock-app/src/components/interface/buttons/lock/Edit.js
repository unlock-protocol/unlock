import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Edit = (props) => (
  <Button label="Edit" {...props}>
    <Svg.Edit name="Edit" />
  </Button>
)

export default Edit
