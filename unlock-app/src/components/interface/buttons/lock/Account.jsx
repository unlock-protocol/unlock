import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Account = (props) => (
  <Button
    label="Account"
    {...props}
    backgroundColor="var(--blue)"
    fillColor="var(--white)"
    showLabel
    size="36px"
  >
    <Svg.Person name="Account" />
  </Button>
)

export default Account
