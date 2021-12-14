import PropTypes from 'prop-types'
import React, { useContext } from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import withConfig, { ConfigContext } from '../../../utils/withConfig'

import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

export function CreatorLockStatus({ hash, confirmations }) {
  const config = useContext(ConfigContext)
  const { network } = useContext(AuthenticationContext)
  let status = 'Submitted'
  if (confirmations > 0) {
    status = 'Confirming'
  }

  return (
    <LockStatus
      target="_blank"
      rel="noopener noreferrer"
      href={config.networks[network].explorer.urls.transaction(hash)}
    >
      <Status>{status}</Status>
      <Confirmations>
        {confirmations > 0 && config.requiredConfirmations >= confirmations && (
          <>
            {confirmations} / {config.requiredConfirmations}
          </>
        )}
      </Confirmations>
    </LockStatus>
  )
}

CreatorLockStatus.propTypes = {
  hash: PropTypes.string.isRequired,
  confirmations: PropTypes.number,
}

CreatorLockStatus.defaultProps = {
  confirmations: 0,
}

export default withConfig(CreatorLockStatus)

export const LockStatus = styled.a`
  align-self: stretch;
  align-items: stretch;
  display: grid;
  text-transform: capitalize;
  background-color: var(--lightgrey);
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 200;
  color: var(--grey);
  border-radius: 0 4px 4px 0;

  &:visited {
    color: var(--grey);
  }
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
  margin-bottom: 15px;
`
