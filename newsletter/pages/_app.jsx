import React from 'react'
import App from 'next/app'

import GlobalStyle from '../theme/globalStyle'

class UnlockApp extends App {
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
