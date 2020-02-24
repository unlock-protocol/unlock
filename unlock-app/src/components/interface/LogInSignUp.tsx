/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import React from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import BrowserOnly from '../helpers/BrowserOnly'
import LogIn from './LogIn'
import SignUp from './SignUp'
import withConfig from '../../utils/withConfig'
import * as GOath from '../../utils/gOauth'

interface Props {
  login?: boolean
  signup?: boolean
  config?: any
}

interface State {
  signup: boolean
}

export class LogInSignUp extends React.Component<Props, State> {
  interval: number | null

  constructor(props: Props) {
    super(props)
    const { signup, login } = props
    this.interval = null
    this.state = {
      signup: signup || !login,
    }
  }

  componentDidMount() {
    if (this.configuredForGoogleOauth()) {
      this.interval = setInterval(this.getGapi, 500)
    }
  }

  toggleSignup = () => {
    this.setState(prevState => ({
      ...prevState,
      signup: !prevState.signup,
    }))
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

    if ((window as any).gapi) {
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

  configuredForGoogleOauth() {
    const config = this.googleConfig()

    return (
      config.googleClientId &&
      config.googleApiKey &&
      config.googleDiscoveryDocs &&
      config.googleScopes
    )
  }

  removeInterval() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  render() {
    const { signup } = this.state
    const configuredForGoogleOauth = this.configuredForGoogleOauth()

    return (
      <BrowserOnly>
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
        {!signup && <LogIn toggleSignup={this.toggleSignup} />}
        {signup && <SignUp toggleSignup={this.toggleSignup} />}
      </BrowserOnly>
    )
  }
}

export default withConfig(LogInSignUp)
