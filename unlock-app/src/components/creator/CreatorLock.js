import React from 'react'
import UnlockPropTypes from '../../propTypes'
import LockIconBar from './lock/LockIconBar'
import CreatorLockConfirming from './lock/CreatorLockConfirming'
import Icon from '../lock/Icon'
import Duration from '../helpers/Duration'
import Balance from '../helpers/Balance'
import styled from 'styled-components'

export function CreatorLock({ lock, status = 'deployed' }) {
  // Some sanitization of strings to display
  let name = lock.name || 'New Lock'
  let outstandingKeys = lock.maxNumberOfKeys - lock.outstandingKeys || 0
  let lockComponentStatusBlock

  if (status === 'deployed') { // the transaction was mined and confirmed at least 12 times
    lockComponentStatusBlock = <LockIconBar lock={lock} className={'lock-icons'} />
  }
  if (status === 'confirming') { // the transaction was mined but hasn't yet been confirmed at least 12 times
    lockComponentStatusBlock = <CreatorLockConfirming lock={lock} />
  }

  // TODO add USD values to lock
  // TODO add all-time balance to lock
  return (
    <LockRow status={status}>
      <Icon lock={lock} address={lock.address} />
      <LockName>
        {name}
        <LockAddress>{lock.address}</LockAddress>
      </LockName>
      <LockDuration>
        <Duration seconds={lock.expirationDuration} />
      </LockDuration>
      <LockKeys>{outstandingKeys}/{lock.maxNumberOfKeys}</LockKeys>
      <Balance amount={lock.keyPrice} />
      <Balance amount={lock.balance} />
      {lockComponentStatusBlock}
    </LockRow>
  )
}

CreatorLock.propTypes = {
  lock: UnlockPropTypes.lock,
  status: UnlockPropTypes.status,
}

export default CreatorLock

export const LockRowGrid = 'grid-template-columns: 32px minmax(100px, 3fr) repeat(4, minmax(56px, 100px)) minmax(174px, 1fr);'

const LockRow = styled.div`
  &:hover {
    .lock-icons {
      visibility: visible;
    }
  }
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  min-height: 60px;
  padding-left: 8px;
  color: var(--slate);
  font-size: 14px;
  box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  display: grid;
  grid-gap: 16px;
  ${LockRowGrid}
  align-items: center;
  margin-bottom: 32px;
`

const LockName = styled.div`
  color: var(--link);
  font-weight: 600;
`

const LockAddress = styled.div`
  color: var(--grey);
  font-weight: 200;
  white-space: nowrap;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LockDuration = styled.div`
`

const LockKeys = styled.div`
`

/* Saving for use with sub-values that need to be added in a future PR
const LockValueSub = styled.div`
  font-size: 0.6em;
  color: var(--grey);
  margin-top: 5px;
`
*/

/* Saving for use with sub-values that need to be added in a future PR
const LockValueUsd = styled.div`
  &:before {
    content: "$ ";
  }
`
*/
