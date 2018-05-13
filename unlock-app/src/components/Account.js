import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import { connect } from 'react-redux'

export const Account = ({ account, showAccountPicker }) => {
  return (
    <div className="input-group col-12">
      <input type="text" className="form-control" disabled="true" defaultValue={account.address} />
      <div className="input-group-append">
        <span className="input-group-text">{account.balance}</span>
        <span className="input-group-text">Wei</span>
        <button className="btn btn-outline-secondary" onClick={(event) => showAccountPicker()} type="button">Sign out</button>
      </div>
    </div>
  )
}

Account.propTypes = {
  account: UnlockPropTypes.account,
  showAccountPicker: PropTypes.func,
}

const mapStateToProps = state => {
  return {
    account: state.network.account,
  }
}

const mapDispatchToProps = dispatch => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(Account)
