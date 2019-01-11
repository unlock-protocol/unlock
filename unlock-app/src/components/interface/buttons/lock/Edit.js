import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Edit = ({ action }) => (
  <Button label="Edit" action={action}>
    <Svg.Edit name="Edit" />
  </Button>
)

export default Edit
