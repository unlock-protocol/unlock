import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import Buttons from '../../interface/buttons/lock'

export function LockIconBar({ lock }) {
  return (
    <IconBar>
      <Buttons.Withdraw />
      <Buttons.Edit />
      <Buttons.ExportLock />
      <Buttons.Code />
    </IconBar>
  )
}

LockIconBar.propTypes = {
  lock: UnlockPropTypes.lock,
}

export default LockIconBar

const IconBar = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(4, 24px);
`
