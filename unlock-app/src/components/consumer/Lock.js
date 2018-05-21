import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'

import React from 'react'
import { connect } from 'react-redux'

import Authenticate from '../Authenticate'
import Account from '../Account'
import { purchaseKey } from '../../actions/key'

export class Lock extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      accountPickerShown: false,
    }
    this.toggleAccountPicker = this.toggleAccountPicker.bind(this)
  }

  toggleAccountPicker() {
    this.setState({ accountPickerShown: !this.state.accountPickerShown })
  }

  render () {
    if (!this.props.lock) {
      return (<span>Loading...</span>)
    }

    const now = new Date().getTime() / 1000
    if (this.props.currentKey.expiration > now) {
      return (<div className="row">
        <div className="col">
          <p>Your key expires at {this.props.currentKey.expiration}</p>
        </div>
      </div>)
    }

    let message = `You need a key to access this content! Purchase one that is valid ${this.props.lock.expirationDuration} seconds for ${this.props.lock.keyPrice}.`
    if (this.props.currentKey.expiration !== 0) {
      message = `Your key has expired! Purchase a new one for ${this.props.lock.keyPrice}.`
    }

    let action = (<button className="btn btn-primary" color="primary" onClick={() => { this.props.purchaseKey(this.props.lock, this.props.account) }}>Purchase</button>)

    let account = (<Account showAccountPicker={this.toggleAccountPicker} />)
    if (this.state.accountPickerShown) {
      account = (<Authenticate hideAccountPicker={this.toggleAccountPicker} />)
    }

    if (this.props.account && this.props.account.balance < this.props.lock.keyPrice) {
      action = (<span>Your eth balance is too low. Do you want to use your credit card?</span>)
    }

    return (
      <div className="card">
        <div className="card-header">
          {account}
        </div>
        <div className="card-body">
          <h5 className="card-title">Members only</h5>
          <p className="card-text">{message}</p>
          {action}
        </div>
      </div>)
  }
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
    currentKey: state.network.key, // key is a reserved props name
    account: state.network.account,
    lock: state.network.lock,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Lock)
