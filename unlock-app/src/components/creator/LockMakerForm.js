import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { createLock } from '../../actions/lock'
import UnlockPropTypes from '../../propTypes'
import Web3Utils from 'web3-utils'

class LockMakerForm extends React.Component {
  constructor (props, context) {
    super(props)
    this.state = {
      keyReleaseMechanism: 0, // Public
      expirationDuration: 30,
      expirationDurationUnit: 86400, // Days
      keyPrice: 0.01,
      keyPriceCurrency: 'ether',
      maxNumberOfKeys: 10,
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    this.setState({ [event.target.id]: event.target.value })
  }

  handleSubmit () {
    const lockParams = {
      keyReleaseMechanism: this.state.keyReleaseMechanism,
      expirationDuration: this.state.expirationDuration * this.state.expirationDurationUnit,
      keyPrice: Web3Utils.toWei(this.state.keyPrice.toString(10), this.state.keyPriceCurrency),
      maxNumberOfKeys: this.state.maxNumberOfKeys,
      creator: this.props.account,
    }
    this.props.createLock(lockParams)
    this.props.showTransactionModal()
  }

  render () {
    return (
      <div className="col">
        <h1>New Lock</h1>
        <form>

          <div className="form-group">
            <label htmlFor="keyReleaseMechanism">Key Release Mechanism</label>
            <select className="form-control" value={this.state.keyReleaseMechanism} onChange={this.handleChange} id="keyReleaseMechanism">
              <option value="0">Public</option>
              <option value="1">Permissioned</option>
              <option value="2">Private</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="expirationDuration">Key Duration</label>
            <div className="input-group">
              <input className="form-control"
                type="number"
                id="expirationDuration"
                value={this.state.expirationDuration}
                onChange={this.handleChange} />
              <select className="custom-select" value={this.state.expirationDurationUnit} onChange={this.handleChange} id="expirationDurationUnit">
                <option value="3600">Hours</option>
                <option value="86400">Days</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="keyPrice">Key Price</label>
            <div className="input-group">
              <input className="input-group-prepend form-control"
                step="0.01"
                type="number"
                id="keyPrice"
                value={this.state.keyPrice}
                onChange={this.handleChange} />
              <select className="custom-select" value={this.state.keyPriceCurrency} onChange={this.handleChange} id="keyPriceCurrency">
                <option value="ether">Ether</option>
              </select>
            </div>

          </div>

          <div className="form-group">
            <label htmlFor="maxNumberOfKeys">Max number of keys</label>
            <input className="form-control"
              type="number"
              id="maxNumberOfKeys"
              value={this.state.maxNumberOfKeys}
              onChange={this.handleChange} />
          </div>

          <button type="button" className="btn btn-primary" onClick={this.handleSubmit}>Submit</button>
        </form>
      </div>)
  }
}

LockMakerForm.propTypes = {
  createLock: PropTypes.func,
  account: UnlockPropTypes.account,
  showTransactionModal: PropTypes.func,
}

const mapStateToProps = state => {
  return {
    account: state.network.account,
  }
}

const mapDispatchToProps = dispatch => ({
  createLock: lock => dispatch(createLock(lock)),
})

export default connect(mapStateToProps, mapDispatchToProps)(LockMakerForm)
