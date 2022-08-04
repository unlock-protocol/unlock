import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Members = (props) => (
  <Button label="Members" {...props}>
    <Svg.Members name="Members" />
  </Button>
)

export default Members
