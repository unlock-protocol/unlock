import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { setNetwork } from '../actions/network'
import { withConfig } from '../utils/withConfig'

export function Network({ setNetwork, config, network }) {
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
            Network
          </div>
          <div className="card-body">

            <div className="input-group mb-3">
              <select className="custom-select" type="select" value={network.name} onChange={(event) => setNetwork(event.target.value)}>
              </select>
              <div className="input-group-append">
                <Link to={'/'} className="fa fa-home btn btn-outline-secondary">
                  Home
                </Link>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>)

}

Network.propTypes = {
  network: UnlockPropTypes.network,
  setNetwork: PropTypes.func,
  config: UnlockPropTypes.configuration,
}

const mapStateToProps = (state) => {
  return {
    network: state.network,
  }
}

const mapDispatchToProps = dispatch => ({
  setNetwork: network => dispatch(setNetwork(network)),
})

export default withConfig(connect(mapStateToProps, mapDispatchToProps)(Network))
