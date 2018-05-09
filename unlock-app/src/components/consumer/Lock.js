import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'

import React from 'react'
import { connect } from 'react-redux'

import Authenticate from '../Authenticate'
import Account from '../Account'
import { purchaseKey } from '../../actions/key'

export const Lock = (props) => {
  if (!props.lock) {
    return (<span>Loading...</span>)
  }

  const now = new Date().getTime() / 1000
  if (props.currentKey.expiration > now) {
    return (<div className="row">
      <div className="col">
        <p>Your key expires at {props.currentKey.expiration}</p>
      </div>
    </div>)
  }

  let message = `You need a key to access this content! Purchase one that is valid ${props.lock.expirationDuration()} seconds for ${props.lock.keyPrice()}.`
  if (props.currentKey.expiration !== 0) {
    message = `Your key has expired! Purchase a new one for ${props.lock.keyPrice()}.`
  }

  let action = (<button className="btn btn-primary" color="primary" onClick={() => { props.purchaseKey(props.lock, props.account) }}>Purchase</button>)
  if (!props.account) {
    action = (<Authenticate />)
  } else if (props.account && props.account.balance < props.lock.keyPrice()) {
    action = (<span>Your eth balance is too low. Do you want to use your credit card?</span>)
  }

  return (
    <div className="card">
      <div className="card-header">
        <Account />
      </div>
      <div className="card-body">
        <h5 className="card-title">Members only</h5>
        <p className="card-text">{message}</p>
        {action}
      </div>
    </div>)
}

Lock.propTypes = {
  account: UnlockPropTypes.account,
  lock: UnlockPropTypes.lock,
  currentKey: UnlockPropTypes.key,
  purchaseKey: PropTypes.func,
}

const mapDispatchToProps = dispatch => ({
  purchaseKey: (lock, account) => dispatch(purchaseKey(lock, account)),
})

const mapStateToProps = state => {
  return {
    currentKey: state.key, // key is a reserved props name
    account: state.account,
    lock: state.lock,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Lock)
