import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import BrowserOnly from '../helpers/BrowserOnly'
import UnlockPropTypes from '../../propTypes'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import DeveloperOverlay from '../developer/DeveloperOverlay'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import AuthenticationPrompt from '../interface/AuthenticationPrompt'
import SignUp from '../interface/SignUp'

export class KeyChainContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      signUp: true,
    }
  }

  render() {
    const { account, network } = this.props
    const { signUp } = this.state

    return (
      <GlobalErrorConsumer>
        <Layout title="Key Chain">
          <Head>
            <title>{pageTitle('Key Chain')}</title>
          </Head>
          {account && (
            <BrowserOnly>
              <Account network={network} account={account} />
              <DeveloperOverlay />
            </BrowserOnly>
          )}
          {!account && !signUp && (
            <BrowserOnly>
              <AuthenticationPrompt />
            </BrowserOnly>
          )}
          {!account && signUp && (
            <BrowserOnly>
              <SignUp /* toggleSignUp={this.toggleSignUp} */ />
            </BrowserOnly>
          )}
        </Layout>
      </GlobalErrorConsumer>
    )
  }
}

KeyChainContent.propTypes = {
  account: UnlockPropTypes.account,
  network: UnlockPropTypes.network.isRequired,
}

KeyChainContent.defaultProps = {
  account: null,
}

export const mapStateToProps = state => {
  return {
    account: state.account,
    network: state.network,
  }
}

export default connect(mapStateToProps)(KeyChainContent)
