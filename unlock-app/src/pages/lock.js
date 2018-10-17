import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import { connect } from 'react-redux'
import Router from 'next/router'
import NoSSR from 'react-no-ssr'

import Authenticate from '../components/Authenticate'
import Account from '../components/Account'

import Key from '../components/consumer/Key'
import { NonValidKey } from '../components/consumer/NonValidKey'

import { purchaseKey } from '../actions/key'
import { withConfig } from '../utils/withConfig'

export class Lock extends React.Component {
  static async getInitialProps({ req, query: { lockaddress } }) {

    // passing :lockaddress query to the component as a prop
    return { lock: lockaddress }
  }

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
    if (!this.props.account || !this.props.lock || !this.props.currentKey) {
      return (<span>Loading...</span>)
    }

    const now = new Date().getTime() / 1000
    let cardBody = null
    let account = (<Account showAccountPicker={this.toggleAccountPicker} />)
    if (this.state.accountPickerShown) {
      account = (<Authenticate hideAccountPicker={this.toggleAccountPicker} />)
    }
    if (this.props.currentKey.expiration > now) {
      cardBody = (<Key currentKey={this.props.currentKey} />)
    } else {
      cardBody = (<NonValidKey currentKey={this.props.currentKey} account={this.props.account} lock={this.props.lock} purchaseKey={this.props.purchaseKey} transaction={this.props.transaction} />)
    }

    return (
      <NoSSR>
        <div className="container">
          <div className="card">
            <div className="card-header">
              {account}
            </div>
            {cardBody}
          </div>
        </div>)
      </NoSSR>
    )
  }
}

Lock.propTypes = {
  account: UnlockPropTypes.account,
  lock: UnlockPropTypes.lock,
  currentKey: UnlockPropTypes.key,
  purchaseKey: PropTypes.func,
  transaction: UnlockPropTypes.transaction,
}

const mapDispatchToProps = dispatch => ({
  purchaseKey: (lock, account) => dispatch(purchaseKey(lock, account)),
})

const mapStateToProps = state => {
  return {
    currentKey: state.network.key, // key is a reserved props name
    account: state.network.account,
    lock: state.network.lock,
    transaction: state.network.account && state.transactions.latest,
  }
}

const Page = withConfig(connect(mapStateToProps, mapDispatchToProps)(Lock))

export default Page
