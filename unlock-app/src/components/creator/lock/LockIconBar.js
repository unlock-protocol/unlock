import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import Buttons from '../../interface/buttons/lock'

export function LockIconBar({ toggleCode }) {
  return (
    <IconBar>
      <Buttons.Withdraw as="button" />
      <Buttons.Edit as="button" />
      { /* Reinstate when we're ready <Buttons.ExportLock /> */ }
      <Buttons.Code action={toggleCode} as="button" />
    </IconBar>
  )
}

LockIconBar.propTypes = {
  toggleCode: PropTypes.func.isRequired,
}

export default LockIconBar

const IconBar = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(3, 24px);
`
