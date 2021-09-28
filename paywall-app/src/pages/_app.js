import App from 'next/app'
import React from 'react'
import GlobalStyle from '../theme/globalStyle.css'

class UnlockApp extends App {
  render() {
    const { Component, pageProps } = this.props

    return (
      <>
        <Component {...pageProps} />
      </>
    )
  }
}

export default UnlockApp
