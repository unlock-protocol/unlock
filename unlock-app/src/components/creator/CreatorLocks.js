import UnlockPropTypes from '../../propTypes'

import React, { Component } from 'react'
import { getLockStatusString } from '../../helpers/Locks'
import CreatorLock from './CreatorLock'

export default class CreatorLocks extends Component {
  render() {
    return (
      <React.Fragment>
        {Object.values(this.props.locks).map((lock, index) => {
          let lockStatus = getLockStatusString(this.props.transactions, lock.address)
          return(<CreatorLock key={index} lock={lock} status={lockStatus}/>)
        })}
      </React.Fragment>
    )
  }
}

CreatorLocks.propTypes = {
  transactions: UnlockPropTypes.transactions,
  locks: UnlockPropTypes.locks,
}
