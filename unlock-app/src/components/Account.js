import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import { connect } from 'react-redux'
import Balance from './helpers/Balance'

export function Account({ account, showAccountPicker }) {
  return (
    <div className="container">
      <div className="row align-items-center">
        <span className="col-6 text-truncate">{account.address}</span>
        <span className="col text-muted text-right text-truncate"><Balance amount={account.balance} /></span>
        <span className="col-2">
          <button className="btn btn-small btn-outline-secondary js-accountSwitch" onClick={(event) => showAccountPicker()} type="button">Switch</button>
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

export default connect(mapStateToProps)(Account)
