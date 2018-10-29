import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import { getStatusStringFromTransaction } from '../../../helpers/locks'
import configure from '../../../config'

const config = configure(global)

export function CreatorLockStatus({ lock, transaction }) {
  let status = getStatusStringFromTransaction(transaction)
  if (status === 'notfound') status = 'Not Found'

  return (
    <LockStatus>
      {status}
      {status == 'confirming' &&
        <Confirmations>
          {transaction.confirmations}
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
  lock: UnlockPropTypes.lock,
  transaction: UnlockPropTypes.transaction,
}

export default CreatorLockStatus

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

const Confirmations = styled.div`
  font-size: 10px;
  margin-top: 11px;
  text-align: center;
`
