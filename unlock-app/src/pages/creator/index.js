import React from 'react'
import PropTypes from 'prop-types'
import NoSSR from 'react-no-ssr'
import { connect } from 'react-redux'
import UnlockPropTypes from '../../propTypes'
import Authenticate from '../../components/Authenticate'
import Account from '../../components/Account'
import { withConfig } from '../../utils/withConfig'
import Layout from '../../components/interface/Layout'
import LockMakerForm from '../../components/creator/LockMakerForm'
import TransactionModal from '../../components/creator/TransactionModal'
import Locks from '../../components/creator/Locks'

import { setTransaction } from '../../actions/transaction'
import NetworkBadge from '../../components/interface/NetworkBadge'

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
        <NetworkBadge/>
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
      <Layout title="Creator">
        <NoSSR>
          <div className="container">
            <NetworkBadge/>
            <header className="navbar navbar-expand navbar-dark flex-column flex-md-row bd-navbar">
              <Account showAccountPicker={this.toggleAccountPicker} />
            </header>
            <div className="row">
              <LockMakerForm showTransactionModal={this.toggleTransactionModal} />
              <Locks />
            </div>
          </div>
        </NoSSR>
      </Layout>
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

const Page = withConfig(connect(mapStateToProps, mapDispatchToProps)(LockMaker))

export default (pageProps) => <Page {...pageProps} />
