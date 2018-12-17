import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Edit = ({ action }) => (
  <Button title="Edit" action={action}>
    <Svg.Edit name="Edit" />
  </Button>
)

export default Edit
