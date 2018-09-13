import React from 'react'
import UnlockPropTypes from '../../propTypes'
import {CreatorLockSaved} from './lock/CreatorLockSaved'

import { LockRow } from './lock/styles'
import CreatorLockConfirming from './lock/CreatorLockConfirming'

export function CreatorLock({ lock, status = 'deployed' }) {
  if (status === 'deployed') { // the transaction was mined and confirmed at least 12 times
    // TODO add USD values to lock
    // TODO add all-time balance to lock
    return (
      <LockRow>
        <CreatorLockSaved lock={lock}/>
      </LockRow>
    )
  }
  if (status === 'confirming') { // the transaction was mined but hasn't yet been confirmed at least 12 times
    return (
      <LockRow>
        <CreatorLockConfirming lock={lock}/>
      </LockRow>
    )
  }
}

CreatorLock.propTypes = {
  lock: UnlockPropTypes.lock,
  status: UnlockPropTypes.status,
}

export default CreatorLock
