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
        <div>
          <p>Pick web3 provider:</p>
          <select
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
        </div>
        <p>
          <Link href="/">
            <a>Return</a>
          </Link>
        </p>
      </NoSSR>
    </Layout>
  )
}

Web3Provider.displayName = 'Web3Provider'

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

const Page = withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Web3Provider)
)

const ProviderPage = pageProps => (
  <NoSSR>
    <Page {...pageProps} />
  </NoSSR>
)

export default ProviderPage
