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
  LockIconBar,
  LockIconBarIcon } from './styles'

export function CreatorLockSaved({ lock }) {
  // Some sanitization of strings to display
  let name = lock.name || 'New Lock'
  let outstandingKeys = lock.maxNumberOfKeys - lock.outstandingKeys || 0

  return (
    <LockRow>
      <LockSaved>
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
        <LockIconBar>
          <LockIconBarIcon>
            <Icons.Withdraw />
          </LockIconBarIcon>
          <LockIconBarIcon>
            <Icons.Edit />
          </LockIconBarIcon>
          <LockIconBarIcon>
            <Icons.Download />
          </LockIconBarIcon>
          <LockIconBarIcon>
            <Icons.Code />
          </LockIconBarIcon>
        </LockIconBar>
      </LockSaved>
    </LockRow>
  )
}

CreatorLockSaved.propTypes = {
  lock: UnlockPropTypes.lock,
}

export default CreatorLockSaved

const LockSaved = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr repeat(4, 1fr) 2fr;
`
