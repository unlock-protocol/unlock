import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

export const Save = ({ onClick, onCancel, as }) => (
  <Button title="Save" action={onClick} onCancel={onCancel} as={as}>
    <Svg.Save name="Save" />
  </Button>
)

export default Save
