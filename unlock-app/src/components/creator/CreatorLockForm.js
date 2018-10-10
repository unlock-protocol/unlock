import React from 'react'
import styled from 'styled-components'
import Icon from '../lock/Icon'
import { BalanceWithUnit, Unit } from '../helpers/Balance'
import { LockRow, LockName, LockDuration, LockKeys } from './CreatorLock'
import { LockStatus } from './lock/CreatorLockConfirming'
import Svg from '../interface/svg'
import Web3Utils from 'web3-utils'
import {secondsAsDays} from '../../utils/durations'

export const CreatorLockForm = (lock) => {
  if (!lock.name) lock = { // Set default values if we haven't been given a lock
    address: '00000000000000', // For icon generation
    name: 'New Lock',
    expirationDuration: '2592000', // 30 days
    maxNumberOfKeys: '10',
    keyPrice: '10000000000000000000', // 10 eth
  }
  let inWei = Web3Utils.toWei(lock.keyPrice || '0', 'wei')
  let inEth = Web3Utils.fromWei(inWei, 'ether')
  return (
    <FormLockRow>
      <Icon lock={lock} address={lock.address} />
      <FormLockName>
        <input type={'text'} name={'name'} defaultValue={lock.name} />
      </FormLockName>
      <FormLockDuration>
        <input type={'text'} name={'duration'} defaultValue={secondsAsDays(lock.expirationDuration)} /> days
      </FormLockDuration>
      <FormLockKeys>
        <input type={'text'} name={'keys'} defaultValue={lock.maxNumberOfKeys} />
      </FormLockKeys>
      <FormBalanceWithUnit>
        <Unit>
          <Svg.Eth width="1em" height="1em" />
        </Unit>
        <input type={'text'} name={'amount'} defaultValue={inEth} />
      </FormBalanceWithUnit>
      <div></div>
      <LockSubmit>
        Submit
        <LockCancel>Cancel</LockCancel>
      </LockSubmit>
    </FormLockRow>
  )
}

const FormLockRow = styled(LockRow)`
  grid-template-columns: 32px minmax(100px, 3fr) repeat(4, minmax(56px, 100px)) minmax(174px, 1fr);
  input[type=text] {
    background-color: var(--lightgrey);
    border: 0;
    padding: 5px;
    font-family: "IBM Plex Sans", sans-serif;
    font-size: 13px;
  }
`

const FormLockName = styled(LockName)`
  input[type=text] {
    width: 70px;
  }
`

const FormLockDuration = styled(LockDuration)`
  input[type=text] {
    width: 30px;
  }
`

const FormLockKeys = styled(LockKeys)`
  input[type=text] {
    width: 40px;
  }
`

const FormBalanceWithUnit = styled(BalanceWithUnit)`
  input[type=text] {
    width: 30px;
  }
  ${Unit} {
    padding-bottom: 5px;
  }
`

const LockSubmit = styled(LockStatus)`
  cursor: pointer;
  text-align: center;
`

const LockCancel = styled.div`
  font-size: 10px;
  margin-top: 5px;
  text-align: center;
`

export default CreatorLockForm
