import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import { connect } from 'react-redux'
import { setAccount } from '../actions/accounts'

export const Account = ({ account, setAccount }) => {
  if (account) {
    return (
      <div className="input-group col-12">
        <input type="text" className="form-control" disabled="true" defaultValue={account.address} />
        <div className="input-group-append">
          <span className="input-group-text">{account.balance}</span>
          <span className="input-group-text">Wei</span>
          <button className="btn btn-outline-secondary" onClick={(event) => setAccount(null)} type="button">Sign out</button>
        </div>
      </div>
    )
  } else {
    return (<span />)
  }
}

Account.propTypes = {
  account: UnlockPropTypes.account,
  setAccount: PropTypes.func,
}

const mapStateToProps = state => {
  return {
    account: state.account,
  }
}

const mapDispatchToProps = dispatch => ({
  setAccount: account => dispatch(setAccount(account)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Account)
