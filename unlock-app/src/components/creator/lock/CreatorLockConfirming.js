import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'

export function CreatorLockConfirming({ lock }) {
  return (
    <LockStatus>
      Pending
    </LockStatus>
  )
}

CreatorLockConfirming.propTypes = {
  lock: UnlockPropTypes.lock,
}

export default CreatorLockConfirming

export const LockStatus = styled.div`
  align-self: stretch;
  justify-content: center;
  align-content: center;
  display: grid;
  background-color: var(--lightgrey);
  font-family: "IBM Plex Sans", sans-serif;
  font-weight: 200;
  color: var(--grey);
`
