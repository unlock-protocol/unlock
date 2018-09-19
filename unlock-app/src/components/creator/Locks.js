import UnlockPropTypes from '../../propTypes'
import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Icon from '../lock/Icon'
import {getLockConfirmations} from '../../helpers/Locks'

const LockInList = (props) => {
  return (<li className="list-group-item">
    <Icon lock={props.lock} address={props.lock.address} />
    <Link to={`/creator/lock/${props.lock.address}`}>
      {props.lock.address} {getLockConfirmations(props.transactions, props.lock.address)}
    </Link>
  </li>)
}

LockInList.propTypes = {
  lock: UnlockPropTypes.lock,
  transactions: UnlockPropTypes.transactions,
}

const Locks = (props) => {
  return (
    <div className="col">
      <h1>Locks</h1>
      <ul className="list-group">
        {[...props.locks].map((lock, idx) => {
          return (
            <LockInList lock={lock} key={idx} transactions={props.transactions} />
          )
        })}
      </ul>
    </div>
  )
}

Locks.propTypes = {
  locks: UnlockPropTypes.locks,
  transactions: UnlockPropTypes.transactions,
}

const mapStateToProps = state => {
  const locks = state.locks || []
  const transactions = state.transactions || {}
  return {
    locks,
    transactions,
  }
}

export default connect(mapStateToProps)(Locks)
