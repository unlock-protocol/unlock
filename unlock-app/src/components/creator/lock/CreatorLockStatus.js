import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import withConfig from '../../../utils/withConfig'

export function CreatorLockStatus({ config, lock, status, confirmations }) {
  return (
    <LockStatus>
      {status}
      {confirmations && (
        <Confirmations>
          {confirmations}
          {' '}
/
          {config.requiredConfirmations}
        </Confirmations>
      )}
    </LockStatus>
  )
}

CreatorLockStatus.propTypes = {
  lock: UnlockPropTypes.lock,
  status: PropTypes.string,
  confirmations: PropTypes.number,
  config: UnlockPropTypes.configuration,
}

export default withConfig(CreatorLockStatus)

export const LockStatus = styled.div`
  align-self: stretch;
  justify-content: center;
  align-content: center;
  display: grid;
  text-transform: capitalize;
  background-color: var(--lightgrey);
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 200;
  color: var(--grey);
`

const Confirmations = styled.div`
  font-size: 10px;
  margin-top: 11px;
  text-align: center;
`
