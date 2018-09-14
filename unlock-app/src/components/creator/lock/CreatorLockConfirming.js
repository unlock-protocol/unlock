import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'

export function CreatorLockConfirming({ lock }) {
  return (
    <LockStatus>
      <LockStatusLabel>
        Pending
      </LockStatusLabel>
    </LockStatus>
  )
}

CreatorLockConfirming.propTypes = {
  lock: UnlockPropTypes.lock,
}

export default CreatorLockConfirming

const LockStatus = styled.div`
  padding: -10px;
  margin: 0;
  margin-top: -10px;
  margin-bottom: -10px;
  background-color: var(--lightgrey);
  text-align: center;
  font-family: "IBM Plex Sans", sans-serif;
  font-weight: 200;
  color: var(--grey);
`

const LockStatusLabel = styled.div`
  margin-top: 30px;
`
