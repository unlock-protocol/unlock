import UnlockPropTypes from '../../propTypes'
import React from 'react'
import { connect } from 'react-redux'

const KeyReleaseMechanism = (props) => {
  if (props.mechanism === '0') {
    return (<span>Public</span>)
  }
  if (props.mechanism === '1') {
    return (<span>Permissioned</span>)
  }
  if (props.mechanism === '2') {
    return (<span>Private</span>)
  }
  return (<span>&nbsp;</span>)
}

KeyReleaseMechanism.propTypes = {
  mechanism: UnlockPropTypes.mechanism,
}

const Lock = (props) => {
  if (!props.lock) {
    return (<span>Loading...</span>)
  }
  return (
    <div className="col">
      <h1>Details</h1>
      <ul className="list-group">
        <li className="list-group-item">
          <p>Key Release Mechanism: <KeyReleaseMechanism mechanism={ props.lock.keyReleaseMechanism() } /></p>
        </li>
        <li className="list-group-item">
          <p>Key Duration (seconds): {props.lock.expirationDuration()}</p>
        </li>
        <li className="list-group-item">
          <p>Key Price: {props.lock.keyPrice()}</p>
        </li>
        <li className="list-group-item">
          <p>Max number of keys: {props.lock.maxNumberOfKeys()}</p>
        </li>
        <li className="list-group-item">
          <p>Owner: {props.lock.owner()}</p>
        </li>
        <li className="list-group-item">
          <p>Balance: {props.lock.balance()}</p>
        </li>
        <li className="list-group-item">
          <p>Outstanding keys: {props.lock.outstandingKeys()}</p>
        </li>
      </ul>
    </div>)
}

Lock.propTypes = {
  lock: UnlockPropTypes.lock,
}

const mapStateToProps = state => {
  return {
    lock: state.network.lock,
  }
}

export default connect(mapStateToProps)(Lock)
