import React, { Component } from 'react'
import styled from 'styled-components'
import Icon from '../lock/Icon'
import Duration from '../helpers/Duration'
import Balance from '../helpers/Balance'
import { LockRow, LockName, LockAddress, LockDuration, LockKeys } from './CreatorLock'
import { LockStatus } from './lock/CreatorLockConfirming'

export default class CreatorLockForm extends Component {
  render() {
    let lock = { // Default values
      address: '00000000000000',
      name: 'New Lock',
      expirationDuration: '86400',
      maxNumberOfKeys: '10',
      keyPrice: '10000000000000000000',
    }
    return (
      <LockRow>
        <Icon lock={lock} address={lock.address} />
        <LockName>
          {lock.name}
        </LockName>
        <LockDuration>
          <Duration seconds={lock.expirationDuration} />
        </LockDuration>
        <LockKeys>{lock.maxNumberOfKeys}</LockKeys>
        <Balance amount={lock.keyPrice} />
        <div></div>
        <LockSubmit>
          Submit
        </LockSubmit>
      </LockRow>
    )
  }
}

const LockSubmit = styled(LockStatus)``
