import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Svg from '../../svg'
import Button from '../Button'

const ConfirmedKey = ({ onClick, ...props }) => (
  <ConfirmedKeyButton
    {...props}
    backgroundHoverColor="var(--green)"
    onClick={onClick}
  >
    <Checkmark />
    <Arrow />
  </ConfirmedKeyButton>
)

ConfirmedKey.propTypes = {
  onClick: PropTypes.func.isRequired,
}

export const Checkmark = styled(Svg.Checkmark)``

export const Arrow = styled(Svg.Arrow)`
  display: none;
`

export const ConfirmedKeyButton = styled(Button)`
  align-self: center;
  &:hover {
    ${Arrow} {
      display: block;
    }
    ${Checkmark} {
      display: none;
    }
  }
`

export default ConfirmedKey
