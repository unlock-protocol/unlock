import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Svg from '../../svg'
import Button from '../Button'
import { HoverFooter, NotHoverFooter } from '../../../lock/HoverFooters'

const ConfirmedKey = ({ hideModal, ...props }) => (
  <ConfirmedKeyButton {...props} backgroundHoverColor="var(--green)">
    <NotHover />
    <Hover onClick={hideModal} />
  </ConfirmedKeyButton>
)

ConfirmedKey.propTypes = {
  hideModal: PropTypes.func.isRequired,
}

const NotHover = styled(Svg.Checkmark)``

const Hover = styled(Svg.Arrow)`
  display: none;
`

const ConfirmedKeyButton = styled(Button)`
  align-self: center;
  &:hover {
    ${Hover} {
      display: block;
    }
    ${NotHover} {
      display: none;
    }
    ~ ${HoverFooter} {
      display: grid;
    }
    ~ ${NotHoverFooter} {
      display: none;
    }
  }
`

export default ConfirmedKey
