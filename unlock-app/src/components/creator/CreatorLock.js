import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import Duration from '../helpers/Duration'
import Balance from '../helpers/Balance'
import Icon from '../lock/Icon'

import Icons from '../interface/icons'

export function CreatorLock({ lock, status = 'deployed' }) {
  // Some sanitization of strings to display
  let name = lock.name || 'New Lock'
  let outstandingKeys = lock.maxNumberOfKeys - lock.outstandingKeys || 0

  if (status === 'deployed') { // the transaction was mined and confirmed at least 12 times
    // TODO add USD values to lock
    // TODO add all-time balance to lock
    return (
      <CreatorLockRow>
        <CreatorLockSaved>
          <CreatorLockIcon><Icon lock={lock} address={lock.address} size={'3'} /></CreatorLockIcon>
          <CreatorLockName>
            {name}
            <CreatorLockAddress>{lock.address}</CreatorLockAddress>
          </CreatorLockName>
          <CreatorLockDuration>
            <Duration seconds={lock.expirationDuration} />
          </CreatorLockDuration>
          <CreatorLockKeys>{outstandingKeys} / {lock.maxNumberOfKeys}</CreatorLockKeys>
          <CreatorLockValue>
            <CreatorLockValueEth><LockCurrency><Icons.Eth /></LockCurrency> <Balance amount={lock.keyPrice} symbol={false} /></CreatorLockValueEth>
          </CreatorLockValue>
          <CreatorLockValue>
            <CreatorLockValueMain><CreatorLockValueEth><LockCurrency><Icons.Eth /></LockCurrency> <Balance amount={lock.balance} symbol={false} /></CreatorLockValueEth></CreatorLockValueMain>
          </CreatorLockValue>
          <CreatorLockIconBar>
            <CreatorLockIconBarIcon>
              <Icons.Withdraw />
            </CreatorLockIconBarIcon>
            <CreatorLockIconBarIcon>
              <Icons.Edit />
            </CreatorLockIconBarIcon>
            <CreatorLockIconBarIcon>
              <Icons.Download />
            </CreatorLockIconBarIcon>
            <CreatorLockIconBarIcon>
              <Icons.Code />
            </CreatorLockIconBarIcon>
          </CreatorLockIconBar>
        </CreatorLockSaved>
      </CreatorLockRow>
    )
  }
  if (status === 'confirming') { // the transaction was mined but hasn't yet been confirmed at least 12 times
    return (
      <CreatorLockRow>
        <CreatorLockConfirming>
          <CreatorLockIcon><Icon lock={lock} address={lock.address} size={'3'} /></CreatorLockIcon>
          <CreatorLockName>
            {name}
            <CreatorLockAddress>{lock.address}</CreatorLockAddress>
          </CreatorLockName>
          <CreatorLockDuration>
            <Duration seconds={lock.expirationDuration} />
          </CreatorLockDuration>
          <CreatorLockKeys>{outstandingKeys} / {lock.maxNumberOfKeys}</CreatorLockKeys>
          <CreatorLockValue>
            <CreatorLockValueEth><LockCurrency><Icons.Eth /></LockCurrency> <Balance amount={lock.keyPrice} symbol={false} /></CreatorLockValueEth>
          </CreatorLockValue>
          <CreatorLockValue>
            <CreatorLockValueMain><CreatorLockValueEth><LockCurrency><Icons.Eth /></LockCurrency> <Balance amount={lock.balance} symbol={false} /></CreatorLockValueEth></CreatorLockValueMain>
          </CreatorLockValue>
          <CreatorLockStatus>
            <CreatorLockStatusLabel>
              Pending
            </CreatorLockStatusLabel>
          </CreatorLockStatus>
        </CreatorLockConfirming>
      </CreatorLockRow>
    )
  }
}

CreatorLock.propTypes = {
  lock: UnlockPropTypes.lock,
  status: UnlockPropTypes.status,
}

export default CreatorLock

const CreatorLockRow = styled.div`
  box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  grid-gap: 8px;
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  color: var(--slate);
  padding: 10px 0 10px 0;
  height: 64px;
`

const CreatorLockSaved = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr repeat(4, 1fr) 2fr;
`

const CreatorLockConfirming = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr repeat(3, 1fr) 2fr 1fr;
`

const CreatorLockIcon = styled.div`
  padding-left: 5px;
`

const CreatorLockName = styled.div`
  color: var(--link);
  font-weight: 600;
`

const CreatorLockAddress = styled.div`
  color: var(--grey);
  font-weight: 200;
  font-size: 0.75em;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CreatorLockDuration = styled.div`
`

const CreatorLockKeys = styled.div`
`

const CreatorLockValue = styled.div`
`

/* Saving for use with sub-values that need to be added in a future PR
const CreatorLockValueSub = styled.div`
  font-size: 0.6em;
  color: var(--grey);
  margin-top: 5px;
`
*/

const CreatorLockValueMain = styled.div`
  font-weight: bold;
`

const CreatorLockValueEth = styled.div`
`

/* Saving for use with sub-values that need to be added in a future PR
const CreatorLockValueUsd = styled.div`
  &:before {
    content: "$ ";
  }
`
*/

const LockCurrency = styled.span`
  font-size: 0.7em;
`

const CreatorLockIconBar = styled.div`
  text-align: right;
  padding-right: 10px;
  padding: 0;
  margin: 0;
  font-size: 28px;
`

const CreatorLockIconBarIcon = styled.div`
  display: inline-block;
  margin-right: 10px;
  cursor: pointer;
`

const CreatorLockStatus = styled.div`
  padding: -10px;
  margin: 0;
  margin-top: -10px;
  margin-bottom: -22px;
  background-color: var(--lightgrey);
  text-align: center;
  font-family: "IBM Plex Sans", sans-serif;
  font-weight: 200;
  color: var(--grey);
`

const CreatorLockStatusLabel = styled.div`
  margin-top: 30px;
`
