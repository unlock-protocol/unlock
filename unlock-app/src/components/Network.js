import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import { connect } from 'react-redux'
import { setNetwork } from '../actions/network'

import { networks } from '../config'

export const Network = ({ setNetwork, network }) => {

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
            <select className="form-control" type="select" value={network.name} onChange={(event) => setNetwork(event.target.value)}>
              {Object.keys(networks).map((name, i) => {
                return (<option value={name} key={i}>{networks[name].name}</option>)
              })}
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>)

}

Network.propTypes = {
  network: UnlockPropTypes.network,
  setNetwork: PropTypes.func,
}

const mapStateToProps = (state) => {
  return {
    network: state.network,
  }
}

const mapDispatchToProps = dispatch => ({
  setNetwork: account => dispatch(setNetwork(account)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Network)
