import React from 'react'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'
import Balance from '../helpers/Balance'
import Duration from '../helpers/Duration'

export function NonValidKey({ account, lock, currentKey, transaction, purchaseKey }) {

  let message = (<p className="card-text">You need a key to access this content! Purchase one that is valid <Duration seconds={lock.expirationDuration} /> for <Balance amount={lock.keyPrice} />.</p>)
  if (currentKey.expiration !== 0) {
    message = (<p className="card-text">Your key has expired! Purchase a new one for <Balance amount={lock.keyPrice} />.</p>)
  }

  let action = (<button className="btn btn-primary" color="primary" onClick={() => { purchaseKey(lock, account) }}>Purchase</button>)

  if (transaction) {
    // We actually want to disable the button
    action = (<div className="form-group">
      <button className="btn btn-primary mx-sm-1" disabled color="primary">Purchase</button>
      <small className="text-muted">{transaction.status}</small>
    </div>)
  }

  if (account && account.balance < lock.keyPrice) {
    action = (<span>Your eth balance is too low. Do you want to use your credit card?</span>)
  }
  return (
    <div className="card-body">
      <h5 className="card-title">Members only</h5>
      {message}
      {action}
    </div>
  )
}

NonValidKey.propTypes = {
  currentKey: UnlockPropTypes.key,
  account: UnlockPropTypes.account,
  lock: UnlockPropTypes.lock,
  transaction: UnlockPropTypes.transaction,
  purchaseKey: PropTypes.func,
}

export default NonValidKey