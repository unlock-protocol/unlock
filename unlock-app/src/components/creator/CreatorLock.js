import React from 'react'
import UnlockPropTypes from '../../propTypes'
import {CreatorLockSaved} from './lock/CreatorLockSaved'
import CreatorLockConfirming from './lock/CreatorLockConfirming'

export function CreatorLock({ lock, status = 'deployed' }) {
  if (status === 'deployed') { // the transaction was mined and confirmed at least 12 times
    // TODO add USD values to lock
    // TODO add all-time balance to lock
    return (
      <CreatorLockSaved lock={lock}/>
    )
  }
  if (status === 'confirming') { // the transaction was mined but hasn't yet been confirmed at least 12 times
    return (
      <CreatorLockConfirming lock={lock}/>
    )
  }
}

CreatorLock.propTypes = {
  lock: UnlockPropTypes.lock,
  status: UnlockPropTypes.status,
}

export default CreatorLock
