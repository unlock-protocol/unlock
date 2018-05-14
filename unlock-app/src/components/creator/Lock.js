import UnlockPropTypes from '../../propTypes'
import React from 'react'
import { connect } from 'react-redux'

const LockOwner = connect((state) => {
  return {
    account: state.network.account.address,
  }
})(({ account, owner }) => {
  if (account === owner) {
    return (<span>  <span className="badge badge-secondary">Me</span> {owner} </span>)
  }
  return (<span>{owner}</span>)
})

const KeyReleaseMechanism = ({ mechanism }) => {
  if (mechanism === '0') {
    return (<span>Public</span>)
  }
  if (mechanism === '1') {
    return (<span>Permissioned</span>)
  }
  if (mechanism === '2') {
    return (<span>Private</span>)
  }
  return (<span>&nbsp;</span>)
}

KeyReleaseMechanism.propTypes = {
  mechanism: UnlockPropTypes.mechanism,
}

const Lock = ({ lock }) => {
  if (!lock) {
    return (<span>Loading...</span>)
  }
  return (
    <div className="col">
      <h1>Details</h1>
      <ul className="list-group">
        <li className="list-group-item">
          <p>Key Release Mechanism: <KeyReleaseMechanism mechanism={ lock.keyReleaseMechanism() } /></p>
        </li>
        <li className="list-group-item">
          <p>Key Duration (seconds): {lock.expirationDuration()}</p>
        </li>
        <li className="list-group-item">
          <p>Key Price: {lock.keyPrice()}</p>
        </li>
        <li className="list-group-item">
          <p>Max number of keys: {lock.maxNumberOfKeys()}</p>
        </li>
        <li className="list-group-item">
          <p>Owner: <LockOwner owner={ lock.owner() } /></p>
        </li>
        <li className="list-group-item">
          <p>Balance: {lock.balance()}</p>
        </li>
        <li className="list-group-item">
          <p>Outstanding keys: {lock.outstandingKeys()}</p>
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
