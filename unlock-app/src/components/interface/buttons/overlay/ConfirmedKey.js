import React from 'react'
import styled from 'styled-components'
import Svg from '../../svg'
import Button from '../Button'

const ConfirmedKey = ({ hideModal, ...props }) => (
  <ConfirmedKeyButton {...props} backgroundHoverColor="var(--green)">
    <NotHover />
    <Hover onClick={hideModal} />
  </ConfirmedKeyButton>
)

const NotHover = styled(Svg.Checkmark)``

const Hover = styled(Svg.Arrow)`
  display: none;
`

const ConfirmedKeyButton = styled(Button)`
  &:hover {
    ${Hover} {
      display: block;
    }
    ${NotHover} {
      display: none;
    }
  }
`

export default ConfirmedKey
