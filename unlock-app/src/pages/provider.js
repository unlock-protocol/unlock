import PropTypes from 'prop-types'
import React from 'react'
import NoSSR from 'react-no-ssr'
import Link from 'next/link'
import Head from 'next/head'
import { connect } from 'react-redux'
import Layout from '../components/interface/Layout'
import UnlockPropTypes from '../propTypes'
import { setProvider } from '../actions/provider'
import withConfig from '../utils/withConfig'
import { pageTitle } from '../constants'

export function Web3Provider({ setProvider, config, provider }) {
  return (
    <Layout title="Pick Web3 Provider">
      <Head>
        <title>{pageTitle('Pick Web3 Provider')}</title>
      </Head>
      <NoSSR>
        <p>
          <p>
            Pick web3 provider:
          </p>
          <select value={provider} onChange={(event) => setProvider(event.target.value)}>
            {Object.keys(config.providers).map((name) => {
              return (<option value={name} key={name}>{name}</option>)
            })}
          </select>
        </p>
        <p>
          <Link href="/">
            <a>Return</a>
          </Link>

        </p>

      </NoSSR>
    </Layout>

  // <div className="container">
  //   <Head>
  //     <title>{pageTitle('Choose provider')}</title>
  //   </Head>
  //   <header className="masthead mb-auto">
  //     <div className="inner">
  //       <h3 className="masthead-brand">&nbsp;</h3>
  //       <nav className="nav nav-masthead justify-content-center" />
  //     </div>
  //   </header>
  //   <div className="row align-items-center justify-content-center" style={{ height: '300px' }}>
  //     <div className="col align-items-center col-6 col-sm-12">
  //       <div className="card">
  //         <div className="card-header">
  //           Provider
  //         </div>
  //         <div className="card-body">

  //           <div className="input-group mb-3">
  //             <select className="custom-select" type="select" value={provider} onChange={(event) => setProvider(event.target.value)}>
  //               {Object.keys(config.providers).map((name) => {
  //                 return (<option value={name} key={name}>{name}</option>)
  //               })}
  //             </select>
  //             <div className="input-group-append">
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // </div>
  )
}

Web3Provider.displayName = 'Web3Provider'

Web3Provider.propTypes = {
  provider: UnlockPropTypes.provider.isRequired,
  setProvider: PropTypes.func.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
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
