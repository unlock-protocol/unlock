import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { createLock } from '../../actions/lock'
import UnlockPropTypes from '../../propTypes'

class LockMakerForm extends React.Component {
  constructor (props, context) {
    super(props)
    this.state = {
      keyReleaseMechanism: 0, // Public
      expirationDuration: 60 * 60 * 24 * 10, // 10 days (in seconds!)
      expirationTimestamp: 0, // for now 0 as we focus on duration based locks
      keyPriceCalculator: 0, // let's focus on fix prices
      keyPrice: 100000, // we should show a better UI to let creators set their price in eth!
      maxNumberOfKeys: 10,
      creator: props.account,
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    this.setState({ [event.target.id]: event.target.value })
  }

  handleSubmit () {
    this.props.createLock(this.state)
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
            <label htmlFor="expirationDuration">Key Duration (seconds)</label>
            <input className="form-control"
              type="number"
              id="expirationDuration"
              value={this.state.expirationDuration}
              onChange={this.handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="keyPrice">Key Price (Wei)</label>
            <input className="form-control"
              type="number"
              id="keyPrice"
              value={this.state.keyPrice}
              onChange={this.handleChange} />
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
