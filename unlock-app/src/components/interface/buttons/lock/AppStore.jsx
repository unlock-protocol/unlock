import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const AppStore = (props) => (
  <Button label="Integrations" {...props}>
    <Svg.AppStore name="Integrations" />
  </Button>
)

export default AppStore
