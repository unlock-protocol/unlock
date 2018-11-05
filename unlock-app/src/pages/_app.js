import App, { Container } from 'next/app'
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

  constructor(props) {
    super(props)

    // Hack to quick the Redux lock middleware on load
    if (!config.isServer) {
      props.reduxStore.dispatch({ type: '@@INIT' })
    }
  }

  render() {
    const { Component, pageProps, reduxStore, router } = this.props

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
