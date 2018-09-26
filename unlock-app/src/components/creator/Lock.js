import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'
import React from 'react'
import { connect } from 'react-redux'
import { withdrawFromLock } from '../../actions/lock'
import Balance from '../helpers/Balance'
import Duration from '../helpers/Duration'

export function LockOwner({ account, owner }) {
  if (account.address === owner) {
    return (<span><span className="badge badge-secondary">Me</span> {owner}</span>)
  }
  return (<span>{owner}</span>)
}

LockOwner.propTypes = {
  owner: PropTypes.string,
  account: UnlockPropTypes.account,
}

export function WithdrawButton({ account, lock, withdrawFromLock }) {
  if (account.address === lock.owner) {
    return (<button className="btn btn-primary btn-sm" onClick={() => { withdrawFromLock(lock) }}>Withdraw</button>)
  }
  return null
}

WithdrawButton.propTypes = {
  lock: UnlockPropTypes.lock,
  account: UnlockPropTypes.account,
  withdrawFromLock: PropTypes.func,
}

export function KeyReleaseMechanism({ mechanism }) {
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

const Lock = ({ lock, account, withdrawFromLock }) => {
  if (!lock) {
    return (<span>Loading...</span>)
  }
  return (
    <div className="col">
      <h1>Details</h1>
      <ul className="list-group">
        <li className="list-group-item">
          <p>Key Release Mechanism: <KeyReleaseMechanism mechanism={ lock.keyReleaseMechanism } /></p>
        </li>
        <li className="list-group-item">
          <p>Key Duration: <Duration seconds={lock.expirationDuration} /></p>
        </li>
        <li className="list-group-item">
          <p>Key Price: <Balance amount={lock.keyPrice} /></p>
        </li>
        <li className="list-group-item">
          <p>Max number of keys: {lock.maxNumberOfKeys}</p>
        </li>
        <li className="list-group-item">
          <p>Owner: <LockOwner account={account} owner={ lock.owner } /></p>
        </li>

        <li className="list-group-item">
          <p>Balance: <Balance amount={lock.balance} />
            <WithdrawButton lock={lock} account={account} withdrawFromLock={withdrawFromLock} />
          </p>
        </li>
        <li className="list-group-item">
          <p>Outstanding keys: {lock.outstandingKeys}</p>
        </li>
      </ul>
    </div>)
}

Lock.propTypes = {
  lock: UnlockPropTypes.lock,
  account: UnlockPropTypes.account,
  withdrawFromLock: PropTypes.func,
}

const mapStateToProps = state => {
  return {
    lock: state.network.lock,
    account: state.account,
  }
}

const mapDispatchToProps = dispatch => ({
  withdrawFromLock: lock => dispatch(withdrawFromLock(lock)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Lock)
