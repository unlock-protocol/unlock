import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Edit = ({ lock, toggleEditing, ...props }) => (
  <Button label="Edit" action={toggleEditing} {...props}>
    <Svg.Edit name="Edit" />
  </Button>
)

export default Edit
