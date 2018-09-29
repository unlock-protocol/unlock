import UnlockPropTypes from '../../propTypes'

import React from 'react'
import { getLockStatusString } from '../../helpers/Locks'
import CreatorLock, { LockRowGrid } from './CreatorLock'
import styled from 'styled-components'

export const CreatorLocks = ({locks, transactions}) => (
  <React.Fragment>
    <LockHeaderRow>
      <LockHeader>Locks</LockHeader>
      <LockMinorHeader>Name / Address</LockMinorHeader>
      <LockMinorHeader>Duration</LockMinorHeader>
      <LockMinorHeader>Quantity</LockMinorHeader>
      <LockMinorHeader>Price</LockMinorHeader>
      <LockMinorHeader>Balance / Earnings</LockMinorHeader>
      <CreateButton>Create Lock</CreateButton>
    </LockHeaderRow>
    {Object.values(locks).map((lock, index) => {
      let lockStatus = getLockStatusString(transactions, lock.address)
      return (<CreatorLock key={index} lock={lock} status={lockStatus} />)
    })}
  </React.Fragment>

)

CreatorLocks.propTypes = {
  transactions: UnlockPropTypes.transactions,
  locks: UnlockPropTypes.locks,
}

const LockHeaderRow = styled.div`
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  padding-left: 8px;
  font-size: 14px;
  display: grid;
  grid-gap: 16px;
  ${LockRowGrid}
  align-items: center;
`

const LockHeader = styled.div`
  font-family: 'IBM Plex Sans';
  font-size: 13px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: var(--grey);
`

const LockMinorHeader = styled.div`
  font-family: 'IBM Plex Mono';
  font-size: 8px;
  font-weight: thin;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--darkgrey);
`

export const ActionButton = styled.button`
  background-color: var(--green);
  border: none;
  font-size: 16px;
  color: var(--darkgrey);
  font-family: "IBM Plex Sans", sans-serif;
  border-radius: 4px;
  justify-self: stretch;
  cursor: pointer;
`

const CreateButton = styled(ActionButton)`
  padding: 10px;
  align-self: end;
`

export default CreatorLocks
