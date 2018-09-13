import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import Icon from '../../lock/Icon'
import Duration from '../../helpers/Duration'
import Icons from '../../interface/icons'
import Balance from '../../helpers/Balance'
import {
  LockRow,
  LockIcon,
  LockName,
  LockAddress,
  LockDuration,
  LockKeys,
  LockValue,
  LockValueEth,
  LockCurrency,
  LockValueMain,
  LockStatus,
  LockStatusLabel } from './styles'

export function CreatorLockConfirming({ lock }) {
  // Some sanitization of strings to display
  let name = lock.name || 'New Lock'
  let outstandingKeys = lock.maxNumberOfKeys - lock.outstandingKeys || 0

  return (
    <LockRow>
      <LockConfirming>
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
        <LockStatus>
          <LockStatusLabel>
            Pending
          </LockStatusLabel>
        </LockStatus>
      </LockConfirming>
    </LockRow>)
}

CreatorLockConfirming.propTypes = {
  lock: UnlockPropTypes.lock,
}

export default CreatorLockConfirming

const LockConfirming = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr repeat(3, 1fr) 2fr 1fr;
`
