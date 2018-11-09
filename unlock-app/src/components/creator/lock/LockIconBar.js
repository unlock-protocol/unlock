import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../../../propTypes'
import Buttons from '../../interface/buttons/lock'

export function LockIconBar({ lock, toggleCode }) {
  return (
    <IconBar>
      <Buttons.PreviewLock lock={lock} />
      <Buttons.Withdraw />
      <Buttons.Edit />
      { /* Reinstate when we're ready <Buttons.ExportLock /> */ }
      <Buttons.Code action={toggleCode} />
    </IconBar>
  )
}

LockIconBar.propTypes = {
  lock: UnlockPropTypes.lock,
  toggleCode: PropTypes.func,
}

export default LockIconBar

const IconBar = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(4, 24px);
`
