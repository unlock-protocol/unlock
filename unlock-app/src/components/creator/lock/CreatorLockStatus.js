import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import withConfig from '../../../utils/withConfig'

export function CreatorLockStatus({ config, hash, status, confirmations }) {
  return (
    <LockStatus
      target="_blank"
      rel="noopener noreferrer"
      href={config.chainExplorerUrlBuilders.etherscan(`/tx/${hash}`)}
    >
      <Status>{status}</Status>
      <Confirmations>
        {status === 'Confirming' &&
          confirmations >= 0 &&
          config.requiredConfirmations >= confirmations && (
            <>
              {confirmations} / {config.requiredConfirmations}
            </>
          )}
      </Confirmations>
    </LockStatus>
  )
}

CreatorLockStatus.propTypes = {
  status: PropTypes.string.isRequired,
  hash: PropTypes.string.isRequired,
  confirmations: PropTypes.number,
  config: UnlockPropTypes.configuration.isRequired,
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
