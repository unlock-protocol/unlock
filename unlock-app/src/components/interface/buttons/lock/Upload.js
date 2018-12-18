import React from 'react'
import Svg from '../../svg'
import { LayoutButton } from '../Button'

const Upload = props => (
  <LayoutButton label="Upload" {...props}>
    <Svg.Upload name="Upload" />
  </LayoutButton>
)

export default Upload
