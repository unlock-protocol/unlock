import UnlockPropTypes from '../../propTypes'
import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Icon from '../lock/Icon'

const LockInList = (props) => {
  return (<li className="list-group-item">
    <Icon lock={props.lock} />
    <Link to={`/creator/lock/${props.lock.address}`}>
      {props.lock.address}
    </Link>
  </li>)
}

LockInList.propTypes = {
  lock: UnlockPropTypes.lock,
}

const Locks = (props) => {
  return (
    <div className="col">
      <h1>Locks</h1>
      <ul className="list-group">
        {[...props.locks].map((lock, idx) => {
          return (
            <LockInList lock={lock} key={idx} />
          )
        })}
      </ul>
    </div>
  )
}

Locks.propTypes = {
  locks: UnlockPropTypes.locks,
}

const mapStateToProps = state => {
  const locks = state.network.account.locks || []
  return {
    locks,
  }
}

export default connect(mapStateToProps)(Locks)
