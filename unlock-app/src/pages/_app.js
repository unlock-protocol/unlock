import App, {Container} from 'next/app'
import React from 'react'
import { Provider } from 'react-redux'
import withReduxStore from '../utils/withReduxStore'
import configure from '../config'
import GlobalStyle from '../theme/globalStyle'

const config = configure(global)
const ConfigContext = React.createContext()

class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  constructor (props) {
    super(props)

    // Hack to quick the Redux lock middleware on load
    if (!config.isServer) {
      props.reduxStore.dispatch({ type: '@@INIT' })

      /* eslint-disable no-console */
      console.info(`
*********************************************************************
Thanks for checking out Unlock!

We're building the missing payments layer for the web: a protocol
which enables creators to monetize their content with a few lines of
code in a fully decentralized way.

We would love your help.

Jobs: https://unlock-protocol.com/jobs

Open source community: https://github.com/unlock-protocol/unlock

Good first issues: https://github.com/unlock-protocol/unlock/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22

Get in touch: hello@unlock-protocol.com

Love,

The Unlock team
*********************************************************************`)
      /* eslint-enable no-console */
    }
  }

  render () {
    const {Component, pageProps, reduxStore, router} = this.props

    return (
      <Container>
        <GlobalStyle />
        <Provider store={reduxStore}>
          <ConfigContext.Provider value={config}>
            <Component {...pageProps} router={router} store={reduxStore} />
          </ConfigContext.Provider>
        </Provider>
      </Container>
    )
  }
}

export default withReduxStore(MyApp)
