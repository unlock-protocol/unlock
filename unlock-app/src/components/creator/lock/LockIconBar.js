import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../../../propTypes'
import Buttons from '../../interface/buttons/lock'

export function LockIconBar({ lock, toggleCode }) {
  return (
    <IconBar>
      <Buttons.PreviewLock lock={lock} title='Preview lock' />
      <Buttons.Withdraw title='Withdraw balance' />
      <Buttons.Edit title='Edit lock' />
      { /* Reinstate when we're ready <Buttons.ExportLock /> */ }
      <Buttons.Code onClick={toggleCode} title='Show embed code' />
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
