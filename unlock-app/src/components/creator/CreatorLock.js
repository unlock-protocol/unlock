import React from 'react'
import UnlockPropTypes from '../../propTypes'
import {CreatorLockSaved} from './lock/CreatorLockSaved'
import CreatorLockConfirming from './lock/CreatorLockConfirming'
import Icon from '../lock/Icon'
import Duration from '../helpers/Duration'
import Icons from '../interface/icons'
import Balance from '../helpers/Balance'
import styled from 'styled-components'

export function CreatorLock({ lock, status = 'deployed' }) {
  // Some sanitization of strings to display
  let name = lock.name || 'New Lock'
  let outstandingKeys = lock.maxNumberOfKeys - lock.outstandingKeys || 0
  let lockComponentStatusBlock

  if (status === 'deployed') { // the transaction was mined and confirmed at least 12 times
    lockComponentStatusBlock = <CreatorLockSaved lock={lock} />
  }
  if (status === 'confirming') { // the transaction was mined but hasn't yet been confirmed at least 12 times
    lockComponentStatusBlock = <CreatorLockConfirming lock={lock} />
  }

  // TODO add USD values to lock
  // TODO add all-time balance to lock
  return (
    <LockRow status={status}>
      <LockIcon><Icon lock={lock} address={lock.address} size={'3'} /></LockIcon>
      <LockName>
        {name}
        <LockAddress>{lock.address}</LockAddress>
      </LockName>
      <LockDuration>
        <Duration seconds={lock.expirationDuration} />
      </LockDuration>
      <LockKeys>{outstandingKeys} / {lock.maxNumberOfKeys}</LockKeys>
      <LockValue>
        <LockValueEth><LockCurrency><Icons.Eth /></LockCurrency> <Balance amount={lock.keyPrice} symbol={false} /></LockValueEth>
      </LockValue>
      <LockValue>
        <LockValueMain><LockValueEth><LockCurrency><Icons.Eth /></LockCurrency> <Balance amount={lock.balance} symbol={false} /></LockValueEth></LockValueMain>
      </LockValue>
      {lockComponentStatusBlock}
    </LockRow>
  )
}

CreatorLock.propTypes = {
  lock: UnlockPropTypes.lock,
  status: UnlockPropTypes.status,
}

export default CreatorLock

const gridLayout = ({ status }) => {
  if (status == 'confirming') {
    return 'grid-template-columns: 1fr 2fr repeat(3, 1fr) 2fr 1fr;'
  } else {
    return 'grid-template-columns: 1fr 2fr repeat(4, 1fr) 2fr;'
  }
}

const LockRow = styled.div`
  box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  grid-gap: 8px;
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  color: var(--slate);
  padding: 10px 0 10px 0;
  height: 64px;
  display: grid;
  ${gridLayout}
`

const LockIcon = styled.div`
  padding-left: 5px;
`

const LockName = styled.div`
  color: var(--link);
  font-weight: 600;
`

const LockAddress = styled.div`
  color: var(--grey);
  font-weight: 200;
  font-size: 0.75em;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LockDuration = styled.div`
`

const LockKeys = styled.div`
`

const LockValue = styled.div`
`

/* Saving for use with sub-values that need to be added in a future PR
const LockValueSub = styled.div`
  font-size: 0.6em;
  color: var(--grey);
  margin-top: 5px;
`
*/

const LockValueMain = styled.div`
  font-weight: bold;
`

const LockValueEth = styled.div`
`

/* Saving for use with sub-values that need to be added in a future PR
const LockValueUsd = styled.div`
  &:before {
    content: "$ ";
  }
`
*/

const LockCurrency = styled.span`
  font-size: 0.7em;
`
