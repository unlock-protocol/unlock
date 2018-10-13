import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'

export function CreatorLockConfirming({ lock, status }) {
  return (
    <LockStatus>
      {status}
    </LockStatus>
  )
}

CreatorLockConfirming.propTypes = {
  lock: UnlockPropTypes.lock,
  status: PropTypes.string,
}

export default CreatorLockConfirming

export const LockStatus = styled.div`
  align-self: stretch;
  justify-content: center;
  align-content: center;
  display: grid;
  text-transform: capitalize;
  background-color: var(--lightgrey);
  font-family: "IBM Plex Sans", sans-serif;
  font-weight: 200;
  color: var(--grey);
`
