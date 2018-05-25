import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import { connect } from 'react-redux'

export function Account({ account, showAccountPicker }) {
  return (
    <div className="container">
      <div className="row align-items-center">
        <span className="col-6 text-truncate">{account.address}</span>
        <span className="col text-muted text-right text-truncate">Ξ {account.balance}</span>
        <span className="col-2">
          <button className="btn btn-small btn-outline-secondary" onClick={(event) => showAccountPicker()} type="button">Sign out</button>
        </span>
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
