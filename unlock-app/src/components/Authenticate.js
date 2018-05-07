import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import React from 'react'

import { createAccount, loadAccount } from '../actions/accounts'

export class Authenticate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      privateKey: '',
    }
    this.handleChange = this.handleChange.bind(this)
    this.loadAccount = this.loadAccount.bind(this)
  }

  handleChange(event) {
    this.setState({ privateKey: event.target.value })
  }

  loadAccount() {
    this.props.loadAccount(this.state.privateKey)
  }

  createAccount() {
    this.props.createAccount()
  }

  render() {
    return (
      <form className="form-inline">
        <div className="form-group">
          <button className="btn btn-outline-secondary" type="button" onClick={this.props.createAccount}>Create account</button>
        </div>

        <div className="form-group mx-sm-3 w-auto">
          <div className="input-group">
            <input type="text" className="form-control" placeholder="Your private key" aria-label="Recipient's username" value={this.state.privateKey} onChange={this.handleChange} />
            <div className="input-group-append" >
              <button className="btn btn-outline-secondary" type="button" onClick={this.loadAccount}>Sign in</button>
            </div>
          </div>
        </div>
      </form>

    )
  }
}

Authenticate.propTypes = {
  createAccount: PropTypes.func,
  loadAccount: PropTypes.func,
}

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => ({
  loadAccount: account => dispatch(loadAccount(account)),
  createAccount: account => dispatch(createAccount(account)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Authenticate)
