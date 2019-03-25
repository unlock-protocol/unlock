import PropTypes from 'prop-types'

import React from 'react'
import Link from 'next/link'
import { connect } from 'react-redux'
import UnlockPropTypes from '../propTypes'
import { setProvider } from '../actions/provider'
import withConfig from '../utils/withConfig'

export const Web3Provider = ({ setProvider, config, provider }) => (
  <div className="container">
    <header className="masthead mb-auto">
      <div className="inner">
        <h3 className="masthead-brand">&nbsp;</h3>
        <nav className="nav nav-masthead justify-content-center" />
      </div>
    </header>
    <div
      className="row align-items-center justify-content-center"
      style={{ height: '300px' }}
    >
      <div className="col align-items-center col-6 col-sm-12">
        <div className="card">
          <div className="card-header">Provider</div>
          <div className="card-body">
            <div className="input-group mb-3">
              <select
                className="custom-select"
                value={provider}
                onChange={event => setProvider(event.target.value)}
              >
                {Object.keys(config.providers).map(name => {
                  return (
                    <option value={name} key={name}>
                      {name}
                    </option>
                  )
                })}
              </select>
              <div className="input-group-append">
                <Link href="/" className="fa fa-home btn btn-outline-secondary">
                  <a>Home</a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

Web3Provider.propTypes = {
  provider: UnlockPropTypes.provider.isRequired,
  setProvider: PropTypes.func.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
}

const mapStateToProps = state => {
  return {
    provider: state.provider,
  }
}

const mapDispatchToProps = dispatch => ({
  setProvider: provider => dispatch(setProvider(provider)),
})

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Web3Provider)
)
