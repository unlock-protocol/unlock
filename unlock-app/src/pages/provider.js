import PropTypes from 'prop-types'
import React from 'react'
import NoSSR from 'react-no-ssr'
import Link from 'next/link'
import { connect } from 'react-redux'
import UnlockPropTypes from '../propTypes'
import { setProvider } from '../actions/provider'
import withConfig from '../utils/withConfig'

export function Web3Provider({ setProvider, config, provider }) {
  return (
    <div className="container">
      <header className="masthead mb-auto">
        <div className="inner">
          <h3 className="masthead-brand">&nbsp;</h3>
          <nav className="nav nav-masthead justify-content-center" />
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
                  <Link href="/">
                    <a className="fa fa-home btn btn-outline-secondary">Home</a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

Web3Provider.displayName = 'Web3Provider'

Web3Provider.propTypes = {
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

const Page = withConfig(connect(mapStateToProps, mapDispatchToProps)(Web3Provider))

export default (pageProps) => // eslint-disable-line react/display-name
  <NoSSR>
    <Page {...pageProps} />
  </NoSSR>
