/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'
import Errors from '../interface/Errors'
import withConfig from '../../utils/withConfig'
import * as GOath from '../../utils/gOauth'

export class SignupContent extends React.Component {
  interval: number | null

  constructor(props: any) {
    super(props)
    this.interval = null
  }

  componentDidMount() {
    if (this.configuredForGoogleOauth()) {
      this.interval = setInterval(this.getGapi, 500)
    }
  }

  googleConfig = () => {
    const { config } = this.props
    const {
      googleApiKey,
      googleClientId,
      googleDiscoveryDocs,
      googleScopes,
    } = config

    return { googleApiKey, googleClientId, googleDiscoveryDocs, googleScopes }
  }

  getGapi = () => {
    const config = this.googleConfig()

    if (gapi) {
      GOath.getGapi({
        apiKey: config.googleApiKey,
        clientId: config.googleClientId,
        discoveryDocs: config.googleDiscoveryDocs,
        scope: config.googleScopes,
        cookiepolicy: 'single_host_origin',
      })
      this.removeInterval()
    }
  }

  removeInterval() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  configuredForGoogleOauth() {
    const config = this.googleConfig()

    return (
      config.googleClientId &&
      config.googleApiKey &&
      config.googleDiscoveryDocs &&
      config.googleScopes
    )
  }

  render() {
    const configuredForGoogleOauth = this.configuredForGoogleOauth()
    return (
      <Layout title="Signup">
        <Head>
          <title>{pageTitle('Signup')}</title>
          {configuredForGoogleOauth && (
            <>
              <meta
                name="google-signin-client_id"
                content={this.googleConfig().googleClientId}
              />
              <script
                src="https://apis.google.com/js/platform.js"
                async
                defer
              />
              <script src="https://apis.google.com/js/api.js" async defer />
            </>
          )}
        </Head>
        <Errors />
        <LogInSignUp signup />
      </Layout>
    )
  }
}

export default withConfig(SignupContent)
