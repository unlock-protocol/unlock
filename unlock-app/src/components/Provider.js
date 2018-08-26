import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { setProvider } from '../actions/provider'
import { withConfig } from '../utils/withConfig'

export function Provider({ setProvider, config, provider }) {
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
            Provider
          </div>
          <div className="card-body">

            <div className="input-group mb-3">
              <select className="custom-select" type="select" value={provider} onChange={(event) => setProvider(event.target.value)}>
                {Object.keys(config.providers).map((name, i) => {
                  return (<option value={name} key={i}>{name}</option>)
                })}
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

Provider.propTypes = {
  provider: UnlockPropTypes.provider,
  setProvider: PropTypes.func,
  config: UnlockPropTypes.configuration,
}

const mapStateToProps = (state) => {
  return {
    provider: state.provider,
  }
}

const mapDispatchToProps = dispatch => ({
  setProvider: provider => dispatch(setProvider(provider)),
})

export default withConfig(connect(mapStateToProps, mapDispatchToProps)(Provider))
