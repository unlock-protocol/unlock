import App from 'next/app'
import React from 'react'

import GlobalStyle from '../theme/globalStyle'

class UnlockApp extends App {
  constructor(props, context) {
    super(props, context)
  }

  render() {
    const { Component, pageProps } = this.props
    return (
      <>
        <GlobalStyle />
        <Component {...pageProps} />
      </>
    )
  }
}

export default UnlockApp
