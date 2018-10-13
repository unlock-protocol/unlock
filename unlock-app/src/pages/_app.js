import App, {Container} from 'next/app'
import React from 'react'
import withReduxStore from '../lib/with-redux-store'
import { Provider } from 'react-redux'
import configure from '../config'
import GlobalStyle from '../theme/globalStyle'

const isServer = typeof window === 'undefined'
const config = !isServer ? configure(global) : {}
const ConfigContext = React.createContext()

class MyApp extends App {
  constructor (props) {
    super(props)
    props.reduxStore.dispatch({ type: '@@INIT' })
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
