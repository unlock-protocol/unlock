import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'
import UnlockPropTypes from '../../propTypes'
import Authenticate from '../Authenticate'
import Account from '../Account'

import LockMakerForm from './LockMakerForm'
import TransactionModal from './TransactionModal'
import Locks from './Locks'
import Lock from './Lock'

import { setTransaction } from '../../actions/transaction'

export class LockMaker extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      accountPickerShown: false,
      transactionModalShown: false,
    }
    this.toggleAccountPicker = this.toggleAccountPicker.bind(this)
    this.toggleTransactionModal = this.toggleTransactionModal.bind(this)
  }

  toggleTransactionModal() {
    if (this.state.transactionModalShown) {
      this.props.setTransaction(null) // Reset the transaction when closing!
    }
    this.setState({ transactionModalShown: !this.state.transactionModalShown })
  }

  toggleAccountPicker () {
    this.setState({ accountPickerShown: !this.state.accountPickerShown })
  }

  render() {
    if (!this.props.account) {
      return null //loading
    }

    if (this.state.accountPickerShown) {
      return (<div className="container">
        <header className="masthead mb-auto">
          <div className="inner">
            <h3 className="masthead-brand">&nbsp;</h3>
            <nav className="nav nav-masthead justify-content-center">
            </nav>
          </div>
        </header>
        <div className="row align-items-center justify-content-center" style={{ height: '300px' }}>
          <div className="col align-items-center col-6 col-sm-12">
            <div className="card">
              <div className="card-header">
                Authenticate
              </div>
              <div className="card-body">
                <Authenticate hideAccountPicker={this.toggleAccountPicker} />
              </div>
            </div>
          </div>
        </div>
      </div>
      )
    }

    if (this.state.transactionModalShown) {
      return (<TransactionModal hideTransactionModal={this.toggleTransactionModal} />)
    }

    return (
      <div className="container">
        <header className="navbar navbar-expand navbar-dark flex-column flex-md-row bd-navbar">
          <Account showAccountPicker={this.toggleAccountPicker} />
        </header>
        <div className="row">
          <LockMakerForm showTransactionModal={this.toggleTransactionModal} />
          <Locks />
          <Route exact={true} path="/" render={() => {
            return (<p></p>)
          }} />
          <Route path="/creator/lock/:lockAddress" component={Lock} />
        </div>
      </div>
    )
  }
}

LockMaker.propTypes = {
  accountPickerShown: PropTypes.bool,
  setTransaction: PropTypes.func,
  account: UnlockPropTypes.account,
}

const mapStateToProps = state => {
  return {
    account: state.network.account,
  }
}

const mapDispatchToProps = dispatch => ({
  setTransaction: (transaction) => dispatch(setTransaction(transaction)),
})

export default connect(mapStateToProps, mapDispatchToProps)(LockMaker)
