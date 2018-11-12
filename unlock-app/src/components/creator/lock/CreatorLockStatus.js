import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import withConfig from '../../../utils/withConfig'

export function CreatorLockStatus({ config, status, confirmations }) {
  return (
    <LockStatus>
      <Status>
        {status}
      </Status>
      {confirmations &&
        <Confirmations>
          {confirmations}
          {' '}
          /
          {' '}
          {config.requiredConfirmations}
        </Confirmations>
      }
    </LockStatus>
  )
}

CreatorLockStatus.propTypes = {
  status: PropTypes.string.isRequired,
  confirmations: PropTypes.number,
  config: UnlockPropTypes.configuration.isRequired,
}

CreatorLockStatus.defaultProps = {
  confirmations: 0,
}

export default withConfig(CreatorLockStatus)

export const LockStatus = styled.div`
  align-self: stretch;
  align-items: stretch;
  display: grid;
  text-transform: capitalize;
  background-color: var(--lightgrey);
  font-family: "IBM Plex Sans", sans-serif;
  font-weight: 200;
  color: var(--grey);
`

const Status = styled.div`
  display: grid;
  justify-content: center;
  font-size: 13px;
  align-self: end;
`

const Confirmations = styled.div`
  display: grid;
  justify-content: center;
  font-size: 10px;
  align-self: center;
`
