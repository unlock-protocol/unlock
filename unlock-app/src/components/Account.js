import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import { connect } from 'react-redux'
import Balance from './helpers/Balance'

import { setNetwork } from '../actions/network'

import { metamaskAvailable } from '../config'

export function Account({ account, isMetamask, showAccountPicker, useMetamask, metamaskAvailable }) {
  return (
    <div className="container">
      <div className="row align-items-center">
        <span className="col-6 text-truncate">{account.address}</span>
        <span className="col text-muted text-right text-truncate"><Balance amount={account.balance} /></span>
        {!isMetamask &&
        <span className="col-2">
          <button className="btn btn-small btn-outline-secondary js-accountSwitch" onClick={(event) => showAccountPicker()} type="button">Switch</button>
        </span>
        }
        {!isMetamask && metamaskAvailable &&
          <span className="col-1 text-right">
            <a className="js-accountUseMetamask" onClick={(event) => useMetamask()}><img src="/images/icons/icon-metamask.png" className="icon" /></a>
          </span>

        }
      </div>
    </div>
  )
}

Account.propTypes = {
  account: UnlockPropTypes.account,
  showAccountPicker: PropTypes.func,
  isMetamask: PropTypes.bool,
  useMetamask: PropTypes.func,
  metamaskAvailable: PropTypes.bool,
}

const mapStateToProps = state => {
  return {
    metamaskAvailable,
    isMetamask: state.network.name === 'metamask',
    account: state.network.account,
  }
}

const mapDispatchToProps = dispatch => ({
  useMetamask: account => dispatch(setNetwork('metamask')),
})

export default connect(mapStateToProps, mapDispatchToProps)(Account)
