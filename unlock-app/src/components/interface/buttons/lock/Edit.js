import React from 'react'
import Svg from '../../svg'
import { LockButton } from '../Button'

const Edit = (props) => (
  <LockButton title='Edit' {...props}>
    <Svg.Edit name="Edit" />
  </LockButton>
)

export default Edit
